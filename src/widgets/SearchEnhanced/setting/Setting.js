define([
        'builder/serviceUtils',
        'dojo/_base/declare',
        'dojo/_base/lang',
        document.location.pathname + "stemapp/widgets/Search/setting/Setting.js",
        'dojo/text!../../Search/setting/Setting.html',
        'dojo/i18n!stemapp/widgets/Search/setting/nls/strings.js'
    ],
    function(
        serviceUtils,
        declare,
        lang,
        ParentSetting,
        parentTemplate,
        parentNls)
    {
        return declare([ParentSetting],
        {
            postMixInProperties: function()
            {
                //  summary:
                //    This function is used to inherit template and nls
                //    settings from the parent widget.

                this.templateString = parentTemplate;
                this.nls = lang.mixin(this.nls, parentNls);

                // This method copies the widget being extended from stemapp to your app
                serviceUtils.copyWidgetToApp(window.appInfo.id, "Search".toLowerCase());

                this.inherited(arguments);
            }
        });
    });
