define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/Deferred",
    "dojo/_base/json",
    "dojo/has",

    "esri/kernel",
    "esri/deferredUtils",
    'libs/custom/utilities/CoordConversionUtilities',
    'esri/tasks/locator'
], function(
    declare, lang, Deferred, djJson, has,
    esriNS, dfdUtils, CoordConversionUtilities, esriLocator
)
{

    var Locator = declare(esriLocator,
    {
        declaredClass: "libs.opir.tasks.CoordinateLocator",

        constructor: function( /*String*/ url)
        {
            this.coordConv = new CoordConversionUtilities();
        },

        isThisCoordType: function( /*String*/ singleLine)
        {
            return false; // override in sub-classes
        },

        obtainCandidates: function( /*String*/ singleLine)
        {
            return []; // override in sub-classes
        },

        parseCandidates: function(candidates, singleLine)
        {
            return []; // override in sub-classes
        },

        parseSuggestions: function(candidates, singleLine)
        {
            return []; // override in sub-classes
        },

        addressToLocations: function( /*Object*/ address, /*String[]?*/ outFields, /*Function?*/ callback, /*Function?*/ errback, /*Envelope?*/ searchExtent)
        {
            var magicKey, distance, location, maxLocations, forStorage, categories, countryCode;

            if (address.address)
            {
                errback = callback;
                callback = outFields;
                outFields = address.outFields;
                searchExtent = address.searchExtent;
                countryCode = address.countryCode;
                magicKey = address.magicKey;
                distance = address.distance;
                categories = address.categories;
                if (address.location && this.normalization)
                {
                    location = address.location.normalize();
                }
                maxLocations = address.maxLocations;
                forStorage = address.forStorage;
                address = address.address;
            }

            if (searchExtent)
            {
                searchExtent = searchExtent.shiftCentralMeridian();
            }

            var outSR = this.outSpatialReference,
                _params = this._encode(
                    lang.mixin(
                        {},
                        address,
                        {
                            f: "json",
                            outSR: outSR && djJson.toJson(outSR.toJson()),
                            outFields: (outFields && outFields.join(",")) || null,
                            searchExtent: searchExtent && djJson.toJson(searchExtent.toJson()),
                            category: (categories && categories.join(",")) || null,
                            countryCode: countryCode || null,
                            magicKey: magicKey || null,
                            distance: distance || null,
                            location: location || null,
                            maxLocations: maxLocations || null,
                            forStorage: forStorage || null
                        }
                    )
                ),
                _h = this._geocodeHandler,
                _e = this._errorHandler,
                dfd = new Deferred(dfdUtils._dfdCanceller);

            var response = {
                "spatialReference":
                {
                    "wkid": 4326,
                    "latestWkid": 4326
                },
                "candidates": []
            };

            var singleLine = address["Single Line Input"];

            if (this.isThisCoordType(singleLine))
            {

                // Obtain the candidates
                var candidates = this.obtainCandidates(singleLine);

                // Parse the candidates
                response.candidates = response.candidates.concat(this.parseCandidates(candidates, singleLine));
            }

            _h(response, null, callback, errback, dfd);

            return dfd;
        },

        suggestLocations: function(params)
        {
            var _params, dfd;
            dfd = new Deferred(dfdUtils._dfdCanceller);

            var suggestions = [];

            if (this.isThisCoordType(params.text))
            {
                // Obtain the candidates
                var candidates = this.obtainCandidates(params.text);

                // Parse the suggestions
                suggestions = this.parseSuggestions(candidates, params.text);

                this.onSuggestLocationsComplete(suggestions);
                dfd.resolve(suggestions);
            }
            else
            {
                // error
                this._errorHandler("Error parsing.");
                dfd.reject( /*["Error string here"]*/ );
            }

            return dfd;
        }
    });

    if (has("extend-esri"))
    {
        lang.setObject("tasks.Locator", Locator, esriNS);
    }

    return Locator;
});
