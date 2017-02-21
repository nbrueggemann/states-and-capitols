define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/on',
    'dojo/text!./templates/HelpTooltipDialog.html',
    'dojo/i18n!./nls/HelpTooltipDialog',
    'xstyle/css!./css/HelpTooltipDialog.css',

    'dijit/TooltipDialog',
    'dijit/popup'
], function(declare, lang, on, template, nls, HelpTooltipDialogCSS,
    TooltipDialog, popup)
{

    return declare([TooltipDialog],
    {
        templateString: template,
        nls: nls,
        title: null,
        content: null,
        isOpen: false,

        postCreate: function()
        {
            this.inherited(arguments);

            this.titleNode.innerHTML = this.title || this.nls.defaultTitle;
            this.contentNode.innerHTML = this.content || this.nls.defaultContent;

            on(this.closeBtn, 'click', lang.hitch(this, function(evt)
            {
                //console.log("Trying to close Help popup.");
                popup.close(this);
            }));
        },

        onOpen: function(pos)
        {
            this.inherited(arguments);
            this.isOpen = true;
        },

        onClose: function()
        {
            this.inherited(arguments);
            this.isOpen = false;
        },

        _setTitleAttr: function(title)
        {
            this.titleNode.innerHTML = title;
        },

        _setContentAttr: function(content)
        {
            this.contentNode.innerHTML = content;
        }
    });
});
