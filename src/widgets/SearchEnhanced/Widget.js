define([
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/on',
    'dojo/string',
    "put-selector/put",

    'widgets/Search/Widget',
    'dojo/text!../Search/Widget.html',
    'dojo/i18n!widgets/Search/nls/strings.js',
    'dojo/i18n!./nls/strings',

    'dijit/popup',
    'esri/InfoTemplate',
    "esri/symbols/PictureMarkerSymbol",

    'jimu/utils',

    'libs/custom/tasks/DDCoordinateLocator',
    'libs/custom/tasks/DMSCoordinateLocator',
    'libs/custom/tasks/MGRSCoordinateLocator',
    'libs/custom/tasks/UTMCoordinateLocator',

    'libs/custom/ui/HelpTooltipDialog/HelpTooltipDialog',
    "libs/custom/utilities/ArrayUtilities"

], function(
    array, declare, lang, on, string, put,
    ParentWidget, parentTemplate, parentNls, nls,
    popup, InfoTemplate, PictureMarkerSymbol,
    jimuUtils,
    DDCoordinateLocator, DMSCoordinateLocator, MGRSCoordinateLocator, UTMCoordinateLocator,
    HelpTooltipDialog, ArrayUtilities
)
{
    // Define the extended class object
    var OPIRSearchObject = {
        //////////////////////////////////////////////////
        //             Extended Properties              //
        //////////////////////////////////////////////////
        isStartupDone: null,
        isCustomizationDone: null,
        helpTooltipDialog: null,
        helpAnchorNode: null,
        helpIconNode: null,
        markerSymbol: null,

        //////////////////////////////////////////////////
        //           New Extended Functions             //
        //////////////////////////////////////////////////

        initializeCustomHelp: function()
        {
            if (this.searchDijit && !this.isCustomizationDone)
            {
                // Customize the out of the box Search Widget to support the following:
                // - Help instructions
                // - Custom highlight marker symbol
                // - Custom coordinate locators
                this.customizeWidget();
                this.isCustomizationDone = true;
            }
        },
        customizeWidget: function()
        {
            // Create the new help icon dom node after the formNode
            this.helpIconNode = put(this.searchDijit.formNode, "+span.help-link",
            {
                title: "Show Help",
                innerHTML: "?"
            });

            // Open the help popup when clicking on the helpIconNode
            on(this.helpIconNode, "click", lang.hitch(this, this.onHelpIconNodeClicked));

            // Create the help anchor node
            this.helpAnchorNode = put(this.domNode, 'div.helpAnchor');

            // Create the new highlight symbol to use when selecting a result
            this.markerSymbol = new PictureMarkerSymbol(this.folderUrl + "images/esriGreenPin16x26.png", 16, 26);
            this.markerSymbol.yoffset = this.markerSymbol.height / 2; // Put the bottom of the symbol on the geometry point

            // Collect help content
            var helpMessages = [];

            // Compare each config source to the sources in the searchDijit
            var allSources = array.map(this.config.sources, function(configSource)
            {
                var source = ArrayUtilities.findItemByProperty(this.searchDijit.sources, "name", configSource.name, true);
                if (!source)
                {
                    // Build a source from the configSource
                    source = this.buildSource(configSource);
                    //console.log("Created new source", source);
                }

                // Ensure each source has its related configSource help property
                if (source && !source.help && configSource.help)
                {
                    source.help = configSource.help;
                }

                // Collect help from each source for display in the popup
                if (source.help)
                {
                    var sourceHelpMessage = source.help;
                    if (this.config.help.sourceTemplate)
                    {
                        sourceHelpMessage = string.substitute(this.config.help.sourceTemplate, source);
                    }
                    helpMessages.push(sourceHelpMessage);
                }

                // Set the highlight symbol to use
                source.highlightSymbol = this.markerSymbol;

                // Add the adjusted source to the list of all sources
                return source;
            }, this);

            // Remove any null sources
            allSources = array.filter(allSources, function(source)
            {
                return !!source;
            }, this);

            // Update the searchDijit to have all the sources
            this.searchDijit.set("sources", allSources);

            // Create help popup dialog
            this.own(this.helpTooltipDialog = new HelpTooltipDialog(
            {
                title: this.config.help.title,
                style: "width: 300px;",
                content: this.config.help.content + helpMessages.join("<br />")
            }));
        },
        buildSource: function(configSource)
        {
            // Get custom locator
            var locator = null;
            switch (configSource.type)
            {
                case "locator_dd":
                    locator = new DDCoordinateLocator();
                    break;
                case "locator_dms":
                    locator = new DMSCoordinateLocator();
                    break;
                case "locator_mgrs":
                    locator = new MGRSCoordinateLocator();
                    break;
                case "locator_utm":
                    locator = new UTMCoordinateLocator();
                    break;
                default:
                    console.error("Skipping config entry due to missing information:", configSource);
                    return null;
            }

            // Build the infoTemplate
            var infoTemplate = null;
            if (configSource.infoTemplateContent && configSource.infoTemplateTitle)
            {
                infoTemplate = new InfoTemplate(configSource.infoTemplateTitle, configSource.infoTemplateContent);
            }

            // Build the source object
            var source = {
                locator: locator,
                outFields: ["*"],
                singleLineFieldName: configSource.singleLineFieldName || "",
                name: jimuUtils.stripHTML(configSource.name || ""),
                maxSuggestions: configSource.maxSuggestions || 10,
                maxResults: configSource.maxResults || 6,
                zoomScale: configSource.zoomScale || 25000,
                placeholder: jimuUtils.stripHTML(configSource.placeholder || ""),
                displayField: "FORMATTEDADDRESS",
                suggestionTemplate: "${FORMATTEDADDRESS}",
                help: configSource.help,
                infoTemplate: infoTemplate
            };

            return source;
        },
        onHelpIconNodeClicked: function(event)
        {
            // Toggle the help visibility
            this.showHelp(!this.helpTooltipDialog.isOpen);
        },
        showHelp: function(open)
        {
            if (open)
            {
                popup.open(
                {
                    popup: this.helpTooltipDialog,
                    around: this.helpAnchorNode
                });
            }
            else
            {
                popup.close(this.helpTooltipDialog);
            }
        },

        //////////////////////////////////////////////////
        //         Override Parent Functions            //
        // Any methods to be overridden should be       //
        // included here with an argument list that     //
        // matches the built-in widget.                 //
        //////////////////////////////////////////////////
        postMixInProperties: function()
        {
            this.inherited(arguments);

            this.templateString = parentTemplate;
            this.nls = lang.mixin(this.nls, parentNls, nls);
        },
        startup: function()
        {
            this.inherited(arguments);

            // Added for help
            this.isStartupDone = true;

            // If no sources are returned from promises, this will be called at the end of startup
            this.initializeCustomHelp();
        },
        _resetSearchDijitStyle: function()
        {
            this.inherited(arguments);

            // If any sources are returned from promises, this will be called after they all resolve
            this.initializeCustomHelp();
        },

        onActive: function()
        {
            this.inherited(arguments);

            // Let the domNode know it's active
            put(this.domNode, ".active");
        },
        onDeActive: function()
        {
            this.inherited(arguments);

            // Let the domNode know it's no longer active
            put(this.domNode, "!active");

            // Hid the help popup
            this.showHelp(false);
        }
    };

    // To extent a widget, you need to derive from ParentWidget.
    var OPIRSearchClass = declare([ParentWidget], OPIRSearchObject);
    return OPIRSearchClass;
});
