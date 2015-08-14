var router = require('express').Router();
var Imap = require('imap'),
    inspect = require('util').inspect;
var fs = require('fs'), fileStream;
var imap;

/**
 * OPEN INBOX
 */


function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
}

/**
* Router stuff
* **/
router.get('/',function(req, res){

});

router.post('/',function(req, res){
    var emails = [];
    var attr = '';
    imap = new Imap({
        user: req.body.email,
        password: req.body.pwd,
        host: 'imap.mail.yahoo.com',
        port: 993,
        tls: true
    });


    /****
     * IMAP events
     */

    /**
     * ready
     */

    imap.once('ready',function(){

        openInbox(function(err, box){
            if (err) throw err;
            imap.search([ 'ALL', ['SINCE', 'May 20, 2010'] ], function(err, results) {
                if (err) throw err;
                var f = imap.fetch(results, { bodies: '', struct: true });
                f.on('message', function(msg, seqno) {
                    //console.log('Message #%d', seqno);
                    var prefix = '(#' + seqno + ') ';
                    msg.on('body', function(stream, info) {
                        //console.log(prefix + 'Body');
                        //stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt'));
                    });
                    msg.once('attributes', function(attrs) {
                        //console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
                        attr = attrs;
                    });
                    msg.once('end', function() {
                        //console.log(prefix + 'Finished');
                        emails.push({
                           attr: attr
                        });
                    });
                });
                f.once('error', function(err) {
                    console.log('Fetch error: ' + err);
                });
                f.once('end', function() {
                    res.status(200).json(emails);
                    //console.log('Done fetching all messages!');
                    imap.end();
                });
            });
        });
    });

    /**
     * error
     */
    imap.once('error',function(error){
        return error;
    });

    /**
     * end
     */
    imap.once('end',function(){
        return 'connection ended';
    });

    imap.connect();
   // res.send({message:'posted!'});
});

module.exports  = router;