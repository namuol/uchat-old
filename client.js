/////////////////////////////////////////
// SOCKET.IO
var socket = new io.Socket();
$('#join-form').hide();
$('#status-msg').html('connecting...');

socket.on('connect', function(){
    $('#status-msg').html('who are you?');
    $('#status-msg').show();
    $('#join-form').show();
    $('#name').focus();
    $('input').attr('disabled',false);
});

socket.on('message',function(data){
    switch(data.type) {
    case 'joined':
    case 'left':
    case 'msg':
        jtpl = jQuery.createTemplate($('#'+data.type+'-jtpl').val());
        txt = jQuery.processTemplateToText(jtpl, data);
        $('#msgs').append(txt);
        
        $('#msgs')[0].scrollTop = $('#msgs')[0].scrollHeight;
        $('#msg').focus();
        break;
    }
});

socket.on('disconnect', function() {
    $('#status-msg').html('error/disconnected :(');
    $('#status-msg').show();
    $('input').attr('disabled','disabled');
    $('body').addClass('disabled');
});

socket.connect();
// SOCKET.IO
/////////////////////////////////////////

/////////////////////////////////////////
// UI BEHAVIOR
var msgHistory = [];
var msgHistoryPos = 0;
var currentMsg = '';

$('#msg').attr('autocomplete','off');

function timeString(time) {
    d = new Date(time);
    h = d.getHours();
    h = h < 10 ? "0" + h : h;
    m = d.getMinutes();
    m = m < 10 ? "0" + m : m;
    s = d.getSeconds();
    s = s < 10 ? "0" + s : s;
    return h + ":" + m + ":" + s;
}

$('#name').focus();
$('#msg').attr('disabled',true);

$('#join-form').submit( function() {
    socket.send({
        type: 'join',
        name: $('#name').val()
    });
    $('#status-msg').hide();
    $('#join-form').hide();
    $('#chat-panel').show();
    return false;
});

function userError(msg) {
    alert(msg);
};

function userMsg(msg) {
    var jtpl = jQuery.createTemplate($('#cmd-jtpl').val());
    var txt = jQuery.processTemplateToText(jtpl, {msg:msg});
    $('#msgs').append(txt);
    
    $('#msgs')[0].scrollTop = $('#msgs')[0].scrollHeight;
    $('#msg').focus();
};

var commands = {
    help: {
        usage:  "help - list all available commands",
        func: function() {
            for(var key in commands) {
                userMsg(commands[key].usage);
            };
        }
    },
    timestamps: {
        usage: "timestamps on|off - toggle timestamp visibility",
        func: function(onOrOff) {
            if(onOrOff == 'on') {
                $('#msgs').removeClass('timestamps-off');
            } else if(onOrOff == 'off') {
                $('#msgs').addClass('timestamps-off');
            } else {
                userError('Use "on" or "off"');
            }
        }
    }
};

$('#msg-form').submit( function() {
    var msg = $('#msg').val();

    if(msg[0] == '/') {
        var cmd = msg.substring(1);
        var cmdName = cmd.split(' ')[0];
        var evalCmd1 = 'typeof(commands.' + $.trim(cmdName) + ')';
        var evalCmd2 = 'typeof(commands.' + $.trim(cmdName) + '.func)';
        if(eval(evalCmd1) === 'object' && 
           eval(evalCmd2) === 'function') {
            var cmdString = 'commands.' + cmdName + '.func(';
            var args = _.without(_.rest(cmd.split(' ')),'').map(function(n) {
                return '"'+n+'"';
            });
            cmdString += args.join(',')
            cmdString += ');'
            eval(cmdString);
        } else { 
            userError('Unknown command: ' + cmd);
        }
    } else {
        socket.send({
            type: 'msg',
            msg: msg
        });
    }
    
    msgHistoryPos = msgHistory.push(msg);

    $('#msg').val('');
    return false;
});

$('#msg').keydown(function(e) {
    switch(e.keyCode) {
    case 38: // UP
        if(msgHistoryPos >= msgHistory.length) {
            currentMsg = $('#msg').val();
        }
        msgHistoryPos = msgHistoryPos <= 0 ? 0 : msgHistoryPos - 1;
        $('#msg').val(msgHistory[msgHistoryPos]);
        break;
    case 40: // DOWN
        if(msgHistoryPos <= msgHistory.length) {
            msgHistoryPos = msgHistoryPos >= msgHistory.length
                ? msgHistory.length
                : msgHistoryPos + 1;
            $('#msg').val(msgHistory[msgHistoryPos]);
        } else {
            $('#msg').val(currentMsg);
        }
        break;
    default:
        currentMsg = $('#msg').val();
    } 
});

// UI BEHAVIOR
/////////////////////////////////////////
