selectfiles = document.getElementById("selectfiles");

host = ''
policyBase64 = ''
signature = ''
callbackbody = ''
filename = ''
key = ''
expire = 0
g_object_name = ''
now = timestamp = Date.parse(new Date()) / 1000; // 当前时间

apiUrl = isEmpty(selectfiles.getAttribute("data-url")) ? '' : selectfiles.getAttribute("data-url"); // 进行接口验签
extensions = isEmpty(selectfiles.getAttribute("data-extensions")) ? 'jpeg,jpg,png,mp4' : selectfiles.getAttribute("data-extensions");
inputId = isEmpty(selectfiles.getAttribute("data-input-id")) ? '' : selectfiles.getAttribute("data-input-id");

/**
 * [send_request 发送GET请求]
 * @return {[type]} [description]
 */
function send_request()
{
	if (isEmpty(apiUrl)) {
		return false;
	}
    var xmlhttp = null;
    if (window.XMLHttpRequest) {
        xmlhttp=new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (xmlhttp!=null) {
        // serverUrl是 用户获取 '签名和Policy' 等信息的应用服务器的URL，请将下面的IP和Port配置为您自己的真实信息。
        // serverUrl = 'http://88.88.88.88:8888/aliyun-oss-appserver-php/php/get.php'
        serverUrl = apiUrl
        xmlhttp.open( "GET", serverUrl, false );
        xmlhttp.send( null );
        return xmlhttp.responseText
    } else {
        alert("Your browser does not support XMLHTTP.");
    }
};

/**
 * [get_signature 获取服务端获取的签名信息]
 * @return {[type]} [description]
 */
function get_signature()
{
    // 可以判断当前expire是否超过了当前时间， 如果超过了当前时间， 就重新取一下，3s 作为缓冲。
    now = timestamp = Date.parse(new Date()) / 1000;
    if (expire < now + 3)
    {
        body = send_request()
        var obj = eval ("(" + body + ")");
        if (obj['code']==1) {
            // console.log(obj);
            host = obj['data']['host']
            policyBase64 = obj['data']['policy']
            accessid = obj['data']['accessid']
            signature = obj['data']['signature']
            expire = parseInt(obj['data']['expire'])
            callbackbody = obj['data']['callback']
            key = obj['data']['dir']
            return true;
        } else {
            console.log(obj['msg']);
            return false;
        }
    }
    return false;
};

/**
 * [random_string 随机字符串]
 * @param  {[type]} len [description]
 * @return {[type]}     [description]
 */
function random_string(len) {
　　len = len || 32;
　　var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
　　var maxPos = chars.length;
　　var pwd = '';
　　for (i = 0; i < len; i++) {
    　　pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

/**
 * [calculate_object_name 文件重命名]
 * @param  {[type]} filename [description]
 * @return {[type]}          [description]
 */
function calculate_object_name(filename) {

    pos = filename.lastIndexOf('.')
    suffix = name = '';
    if (pos != -1) {
        var name_arry = filename.split('.');
        name = md5(name_arry[0]);
        suffix = name_arry[1];
    } else {
        name = random_string(10);
    }

    g_object_name = key + name + '.' + suffix
}

/**
 * [set_upload_param 执行文件上传]
 * @param {[type]} up       [description]
 * @param {[type]} filename [description]
 * @param {[type]} ret      [description]
 */
function set_upload_param(up, filename, ret)
{
    if (ret == false) {
        ret = get_signature()
    }
    g_object_name = key;
    if (filename != '') {
        // suffix = get_suffix(filename)
        calculate_object_name(filename)
    }
    new_multipart_params = {
        'key' : g_object_name,
        'policy': policyBase64,
        'OSSAccessKeyId': accessid,
        'success_action_status' : '200', //让服务端返回200,不然，默认会返回204
        'callback' : callbackbody,
        'signature': signature,
    };
    up.setOption({
        'url': host,
        'multipart_params': new_multipart_params
    });
    up.start();
}

//判断字符是否为空的方法
function isEmpty(obj){
    if(typeof obj == "undefined" || obj == null || obj == ""){
        return true;
    }else{
        return false;
    }
}

var uploader = new plupload.Uploader({
	runtimes : 'html5,flash,silverlight,html4',
	browse_button : 'selectfiles',
    multi_selection: false,
	container: document.getElementById('container'),
	flash_swf_url : 'lib/plupload-2.1.2/js/Moxie.swf',
	silverlight_xap_url : 'lib/plupload-2.1.2/js/Moxie.xap',
    url : 'https://oss.aliyuncs.com',

    filters: {
        mime_types : [ //只允许上传图片和zip文件
            { title : "Image files", extensions : extensions },
        ],
        max_file_size : '10mb', //最大只能上传10mb的文件
        prevent_duplicates : true //不允许选取重复文件
    },

	init: {
        //初始化完成
        onPostInit: function(up) {
            console.log(up);
        },

		PostInit: function() {

		},

		FilesAdded: function(up, files) {
			plupload.each(files, function(file) {
                set_upload_param(uploader, '', false); // 文件点开直接上传
                return false;
			});
		},

		BeforeUpload: function(up, file) {
            set_upload_param(up, file.name, true);
        },

		UploadProgress: function(up, file) {
            up.settings.browse_button[0].innerHTML = '<span>已上传：' + file.percent + "%</span>";
		},

		FileUploaded: function(up, file, info) {
            if (info.status == 200 || info.status == 203) {
            	document.getElementById(inputId).value = '/' + g_object_name

                console.log('文件名称:' + g_object_name + ' 回调服务器返回的内容是:' + info.response);
            } else {
                console.log(info.response);
            }
        },

        Error: function(up, err) {
            if (err.code == -600) {
                console.log("文件过大，请更换适合大小的文件");
            } else if (err.code == -601) {
                console.log("当前后缀文件不可上传");
            } else if (err.code == -602) {
                console.log("这个文件已经上传过一遍了");
            } else {
                console.log(err.response);
            }
		},

        addFile: function(e, i) {
            function n(e, t) {
                var i = [];
                l.each(u.settings.filters, function(t, n) {
                    s[n] && i.push(function(i) {
                        s[n].call(u, t, e, function(e) {
                            i(!e)
                        })
                    })
                }), l.inSeries(i, t)
            }

            function a(e) {
                var s = l.typeOf(e);
                if (e instanceof t.file.File) {
                    if (!e.ruid && !e.isDetached()) {
                        if (!o) return !1;
                        e.ruid = o, e.connectRuntime(o)
                    }
                    a(new l.File(e))
                } else e instanceof t.file.Blob ? (a(e.getSource()), e.destroy()) : e instanceof l.File ? (i && (e.name = i), d.push(function(t) {
                    n(e, function(i) {
                        i || (T.push(e), f.push(e), u.trigger("FileFiltered", e)), r(t, 1)
                    })
                })) : -1 !== l.inArray(s, ["file", "blob"]) ? a(new t.file.File(null, e)) : "node" === s && "filelist" === l.typeOf(e.files) ? l.each(e.files, a) : "array" === s && (i = null, l.each(e, a))
            }
            var o, u = this,
                d = [],
                f = [];
            o = c(), a(e), d.length && l.inSeries(d, function() {
                f.length && u.trigger("FilesAdded", f)
            })
        },
	}
});

uploader.init();
