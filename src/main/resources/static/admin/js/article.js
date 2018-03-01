var mditor, htmlEditor, mdEditor;
var tale = new $.tale();
var attach_url = $('#attach_url').val();
// 每60秒自动保存一次草稿
// var refreshIntervalId = setInterval("autoSave()", 60 * 1000);
var content;
var tinyMCE;
//文章的类型
var fmtType = $('#fmtType');
//切换富文本编辑器按钮
var switchBtn = $('#switch-btn');
//缩略图添加区域
var dropZone = $('#dropzone'), dropZoneContainer = $('#dropzone-container');
Dropzone.autoDiscover = false;

$(document).ready(function () {

    init();
    //初始化markdown编辑器
    initEditor();

    // mditor = $("#md-editor");
    // mditor = window.mditor = Mditor.fromTextarea(document.getElementById('md-editor'));
    //tinymce初始化

    // 富文本编辑器
    htmlEditor = $('.summernote').summernote({
        lang: 'zh-CN',
        height: 340,
        placeholder: '写点儿什么吧...',
        //上传图片的接口
        callbacks: {
            onImageUpload: function (files) {
                var data = new FormData();
                data.append('image_up', files[0]);
                tale.showLoading();
                $.ajax({
                    url: '/admin/attach/upload',     //上传图片请求的路径
                    method: 'POST',            //方法
                    data: data,                 //数据
                    processData: false,        //告诉jQuery不要加工数据
                    dataType: 'json',
                    contentType: false,        //<code class="javascript comments"> 告诉jQuery,在request head里不要设置Content-Type
                    success: function (result) {
                        tale.hideLoading();
                        if (result && result.success) {
                            var url = attach_url + result.payload[0].fkey;
                            console.log('url =>' + url);
                            htmlEditor.summernote('insertImage', url);
                        } else {
                            tale.alertError(result.msg || '图片上传失败');
                        }
                    }
                });
            }
        }
    });

    //编辑器容器
    var mdContainer = $('#md-container'), htmlContainer = $('#html-container');
    //根据文章
    // 富文本编辑器
    if (fmtType.val() !== 'markdown') {
        //TODO 初始值清空失败，待处理
        // mditor.value = '';
        if (mdEditor !== null && mdEditor !== undefined)
            mdEditor.html("");
        var tempText = $("#editor").html();
        if (null !== tempText && undefined !== tempText && tempText.length > 0) {
            htmlContainer.find(".note-editable").empty().html(tempText);
            htmlContainer.find(".note-placeholder").hide();
        }
        mdContainer.hide();
        htmlContainer.show();
        switchBtn.text('切换为Markdown编辑器');
        switchBtn.attr('type', 'texteditor');
    } else {
        mdContainer.show();
        htmlContainer.hide();
        fmtType.val('markdown');
        switchBtn.attr('type', 'markdown');
        switchBtn.text('切换为富文本编辑器');
        htmlEditor.summernote("code", "");
    }

    /*
     * 切换编辑器
     * */
    switchBtn.click(function () {
        var type = fmtType.val();
        var this_ = $(this);
        if (type === 'markdown') {
            //获取临时文本
            var tempText = mdEditor.html();
            // 切换为富文本编辑器
            if (null !== tempText && undefined !== tempText && tempText.length > 0) {
                htmlContainer.find(".note-editable").empty().html(tempText);
                htmlContainer.find(".note-placeholder").hide();
            }
            mdEditor.html("");
            mdContainer.hide();
            htmlContainer.show();
            this_.text('切换为Markdown编辑器');
            fmtType.val('html');
        } else {
            // 切换为markdown编辑器

            if (htmlContainer.find(".note-editable").html().length > 0) {
                mdEditor.html(htmlContainer.find(".note-editable").html());
            }
            htmlContainer.hide();
            mdContainer.show();
            fmtType.val('markdown');
            this_.text('切换为富文本编辑器');
            htmlEditor.summernote("code", "");
        }
    });
    // Tags Input
    $('#tags').tagsInput({
        width: '100%',
        height: '35px',
        defaultText: '请输入文章标签'
    });

    $('.toggle').toggles({
        on: true,
        text: {
            on: '开启',
            off: '关闭'
        }
    });

    $('#multiple-sel').select2({
        width: '100%'
    });

    $('div.allow-false').toggles({
        off: true,
        text: {
            on: '开启',
            off: '关闭'
        }
    });

    //添加缩略图开关
    var thumbToggle = $('#thumb-toggle');
    if (thumbToggle.attr('thumb_url') !== '') {
        thumbToggle.toggles({
            on: true,
            text: {
                on: '开启',
                off: '关闭'
            }
        });
        thumbToggle.attr('on', 'true');
        dropZone.css('background-image', 'url(' + $('#thumb-container').attr('thumb_url') + ')');
        dropZone.css('background-size', 'cover');
        dropZoneContainer.show();
    } else {
        thumbToggle.toggles({
            off: true,
            text: {
                on: '开启',
                off: '关闭'
            }
        });
        thumbToggle.attr('on', 'false');
        dropZoneContainer.hide();
    }

    var thumbdropzone = $('.dropzone');

    // 缩略图上传
    dropZone.dropzone({
        url: "/admin/attach/upload",
        filesizeBase: 1024,//定义字节算法 默认1000
        maxFilesize: '10', //MB
        fallback: function () {
            tale.alertError('暂不支持您的浏览器上传!');
        },
        acceptedFiles: 'image/*',
        dictFileTooBig: '您的文件超过10MB!',
        dictInvalidInputType: '不支持您上传的类型',
        init: function () {
            this.on('success', function (files, result) {
                console.log("upload success..");
                console.log(" result => " + result);
                if (result && result.success) {
                    var url = attach_url + result.payload[0].fkey;
                    console.log('url => ' + url);
                    thumbdropzone.css('background-image', 'url(' + url + ')');
                    thumbdropzone.css('background-size', 'cover');
                    $('.dz-image').hide();
                    $('#thumbImg').val(url);
                }
            });
            this.on('error', function (a, errorMessage, result) {
                if (!result.success && result.msg) {
                    tale.alertError(result.msg || '缩略图上传失败');
                }
            });
        }
    });

});

//初始化
function init() {
    //获取iframe中的元素
    mdEditor = $("#md-editor_ifr").contents().find("#tinymce");
    if (fmtType.val() === 'markdown')
        mdEditor.html($("#editor").html());
}

//初始化编辑器
function initEditor() {
    tinyMCE = tinymce.init({
        selector: 'div#md-editor',//替换id为md-editor的div
        //工具条
        toolbar: "image codesample",
        height: 350,
        //皮肤
        skin: "lightgray-gradient",
        paste_data_images: true,//是否支持图像粘贴
        //插件加载
        plugins: ["image imagetools",
            "codesample code",//代码编辑器
            "paste",//粘贴板PowerPaste
            'textpattern'],
        //匹配
        textpattern_patterns: [
            {start: '*', end: '*', format: 'italic'},
            {start: '**', end: '**', format: 'bold'},
            {start: '#', format: 'h1'},
            {start: '##', format: 'h2'},
            {start: '###', format: 'h3'},
            {start: '####', format: 'h4'},
            {start: '#####', format: 'h5'},
            {start: '######', format: 'h6'},
            {start: '1. ', cmd: 'InsertOrderedList'},
            {start: '* ', cmd: 'InsertUnorderedList'},
            {start: '- ', cmd: 'InsertUnorderedList'},
            // {start: '```', cmd: ''}
        ],
        //内联模式
        inline: false,
        codesample_dialog_width: '400',
        codesample_dialog_height: '400',
        codesample_languages: [
            {text: 'C', value: 'c'},
            {text: 'C#', value: 'csharp'},
            {text: 'C++', value: 'cpp'},
            {text: 'CSS', value: 'css'},
            {text: 'Git', value: 'git'},
            {text: 'HTML/XML', value: 'markup'},
            {text: 'HTTP', value: 'http'},
            {text: 'HTML', value: 'html'},
            {text: 'JavaScript', value: 'javascript'},
            {text: 'Java', value: 'java'},
            {text: 'JSON', value: 'json'},
            {text: 'Python', value: 'python'},
            {text: 'PHP', value: 'php'},
            {text: 'Ruby', value: 'ruby'},
            {text: 'SQL', value: 'sql'},
            {text: 'vim', value: 'vim'},
            {text: 'YAML', value: 'yaml'},
        ],
        init_instance_callback: function (editor) {
            init();
        }
    });

}

/*
 * 自动保存为草稿
 * */
function autoSave() {
    // var content = $('#fmtType').val() == 'markdown' ? mditor.val() : htmlEditor.summernote('code');
    var content = fmtType.val() === 'markdown' ? mdEditor.html() : htmlEditor.summernote('code');
    //文章提交表单
    var articleForm = $('#articleForm');
    var title = articleForm.find("input[name=title]").val();
    if (title !== '' && content !== '') {
        $('#content-editor').val(content);
        articleForm.find("#categories").val($('#multiple-sel').val());
        var params = articleForm.serialize();
        var url = articleForm.find('#cid').val() !== '' ? '/admin/article/modify' : '/admin/article/publish';
        tale.post({
            url: url,
            data: params,
            success: function (result) {
                if (result && result.success) {
                    articleForm.find('#cid').val(result.payload);
                } else {
                    tale.alertError(result.msg || '保存文章失败');
                }
            }
        });
    }
}

/**
 * 保存文章
 * @param status
 */
function subArticle(status) {
    // var content = $('#fmtType').val() == 'markdown' ? mditor.value : htmlEditor.summernote('code');
    var content = fmtType.val() === 'markdown' ? mdEditor.html() : htmlEditor.summernote('code');
    //文章提交表单
    var articleForm = $('#articleForm');
    var title = articleForm.find("input[name=title]").val();
    if (title === '') {
        tale.alertWarn('请输入文章标题');
        return;
    }
    if (content === '') {
        tale.alertWarn('请输入文章内容');
        return;
    }
    // clearInterval(refreshIntervalId);
    $('#content-editor').val(content);
    articleForm.find("#status").val(status);
    articleForm.find("#categories").val($('#multiple-sel').val());
    var params = articleForm.serialize();
    var url = articleForm.find('#cid').val() !== '' ? '/admin/article/modify' : '/admin/article/publish';
    tale.post({
        url: url,
        data: params,
        success: function (result) {
            if (result && result.success) {
                tale.alertOk({
                    text: '文章保存成功',
                    then: function () {
                        setTimeout(function () {
                            window.location.href = '/admin/article';
                        }, 500);
                    }
                });
            } else {
                tale.alertError(result.msg || '保存文章失败');
            }
        }
    });
}

function allow_comment(obj) {
    var this_ = $(obj);
    var on = this_.attr('on');
    if (on == 'true') {
        this_.attr('on', 'false');
        $('#allowComment').val('false');
    } else {
        this_.attr('on', 'true');
        $('#allowComment').val('true');
    }
}

function allow_ping(obj) {
    var this_ = $(obj);
    var on = this_.attr('on');
    if (on == 'true') {
        this_.attr('on', 'false');
        $('#allowPing').val('false');
    } else {
        this_.attr('on', 'true');
        $('#allowPing').val('true');
    }
}


function allow_feed(obj) {
    var this_ = $(obj);
    var on = this_.attr('on');
    if (on == 'true') {
        this_.attr('on', 'false');
        $('#allowFeed').val('false');
    } else {
        this_.attr('on', 'true');
        $('#allowFeed').val('true');
    }
}

function add_thumbimg(obj) {
    var this_ = $(obj);
    var on = this_.attr('on');
    console.log(on);
    if (on == 'true') {
        this_.attr('on', 'false');
        dropZoneContainer.addClass('hide');
        $('#thumbImg').val('');
    } else {
        this_.attr('on', 'true');
        dropZoneContainer.removeClass('hide');
        dropZoneContainer.show();
    }
}