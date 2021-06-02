$.Popup = {
    callback : null,
    showPopup: function(elementID, strMsg, bSelfClose, toFocusID="", callback= null) {
        var $el = $(elementID + "_BODY");
        var isDim = $el.prev().hasClass('popup_bg');

        if(strMsg != "") {
            $(elementID + "_TEXT").text(strMsg);
        }
        
        $(elementID).show();
        // $(elementID).fadeIn();

        $.Popup.KeyBlock(elementID);
        
        var $elWidth = ~~($el.outerWidth()),
            $elHeight = ~~($el.outerHeight()), 
            docWidth = $(document).width(),
            docHeight = $(document).height();

        // 화면의 중앙에 레이어를 띄운다.
        if ($elHeight < docHeight || $elWidth < docWidth) {
            $el.css({
                marginTop: -$elHeight /2,
                marginLeft: -$elWidth/2
            })
        } else {
            $el.css({top: 0, left: 0});
        }

        callback != null ? $.Popup.callback = callback : $.Popup.callback = null;
        if( bSelfClose) {
            $('.btn_popup_close').click(function() {
                if(toFocusID != "") {
                    $(toFocusID).focus();
                }
                $.Popup.hidePopup();
                return false;
            });
            //
            // $('.btn_popup_callback').click(function() {
            //     callback();
            // });

            // $('.popup_bg').click(function() {
            //     if(toFocusID != "") {
            //         $(toFocusID).focus();
            //     }
            //     $.Popup.hidePopup();
            //     return false;
            // });
        }        
    },
    hidePopup: function(callback = null) {
        $('.popup').hide();
        // $('.popup').fadeOut();
        $.Popup.KeyUnBlock();
        $("#AREA_LAYER_POPUP").empty();


        // $("#DIV_SCRIPT").empty();
    },
    confirmPopup: function(callback = null) {
        $('.popup').hide();
        // $('.popup').fadeOut();
        $.Popup.KeyUnBlock();
        $("#AREA_LAYER_POPUP").empty();
        if($.Popup.callback!=null) {
            $.Popup.callback();
        }

        // $("#DIV_SCRIPT").empty();
    },
    KeyBlock: function(target) {
        $('html').on('keypress', function(e) {
            return;
            // if(e.keyCode == 13) {
            //     $(target).fadeOut();
            //     $("html").off("keypress");
            // }
        });
    },
    KeyUnBlock: function() {
        $("html").off("keypress");
    }
}