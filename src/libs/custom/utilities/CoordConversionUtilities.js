/**
 * Utility class to convert a string value in various coord formats (MGRS, UTM,
 * etc) into a Point geometry.
 */
define([
    "dojo/_base/declare",

    'libs/usng/usng',
    'libs/usng/utils',

    'esri/geometry/Point',
    'esri/SpatialReference'

], function(declare, usng, usngUtils, Point, SpatialReference)
{
    return declare("CoordConversionUtilities", null,
    {
        _ddRegEx: /^([\-+]?\d{1,3})(\.\d*)?[\u00B0d]?\s*([NS])?(?:\s*,\s*|\s+)([\-+]?\d{1,3})(\.\d*)?[\u00B0d]?\s*([EW])?$/,
        _dmRegEx: /^([+\-]?\d{1,3})([\u00B0d:]\s*|\s+)(\d{1,2})(\.\d*)?['m\u2019\u2032:]?\s*([NS])?\s*,?\s*([+\-]?\d{1,3})([\u00B0d:]\s*|\s+)(\d{1,2})(\.\d*)?['m\u2019\u2032]?\s*([EW])?$/i,
        _dmsRegEx: /^([\-+]?\d{1,2})([\u00B0d:]\s*|\s+)(\d{1,2})(['´\u2019\u2032m:]\s*|\s+)(\d{1,2})(\.\d*)?(["\u201ds\u2033]?\s*)([NS])?\s*,?\s*([\-+]?\d{1,3})([\u00B0d:]\s*|\s+)(\d{1,2})(['´\u2019\u2032m:]\s*|\s+)(\d{1,2})(\.\d*)?(["\u201ds\u2033]?\s*)([EW])?$/i,
        _dmsRegEx2: /^(\d{2}):?(\d{2}):?(\d{2})(\.?(\d{1,3}))?([NS])[\/, ]0?(1?\d{2}?):?(\d{2}):?(\d{2})(\.?(\d{1,3}))?([WE])$/i,

        convertMgrsToPoint: function(value)
        {
            var point = null;

            var coord = usngUtils.lookupMgrs(value);
            if (coord)
            {
                point = new Point(coord.longitude, coord.latitude);
            }
            else
            {
                // If the parsing of MGRS failed then prepend a "0" for assumed
                // leading 0 zones and try parsing again.
                coord = usngUtils.lookupMgrs("0" + value);
                if (coord)
                {
                    point = new Point(coord.longitude, coord.latitude);
                }
            }

            return point;
        },
        convertUtmToPoint: function(value)
        {
            var point = null;

            if (value && typeof value === "string")
            {
                var vals = value.split(" ");
                if (vals.length === 3)
                {
                    var coord = {};
                    coord.lat = null;
                    coord.lon = null;
                    usng.UTMtoLL(vals[2], vals[1], vals[0], coord);

                    if (!isNaN(coord.lat) && !isNaN(coord.lon))
                    {
                        point = new Point(coord.lon, coord.lat);
                    }
                }
            }

            return point;
        },
        convertDDToPoint: function(value)
        {
            var point = null;

            if (value && typeof value === "string")
            {
                var vals = value.split(",");
                if (vals.length === 2)
                {
                    var lat = Number(vals[0]);
                    var lon = Number(vals[1]);

                    if (!isNaN(lat) && !isNaN(lon))
                    {
                        point = new Point(lon, lat);
                    }
                }
            }

            return point;
        },
        convertDMSToPoint: function(value)
        {
            var candidates = [];

            if (value && typeof value === "string")
            {
                // We need to parse this string and turn it into a lat/lon
                value = value.trim();

                if (this.isDMS(value))
                {
                    candidates = this.parseDMS(value);
                }
            }
            return candidates;
        },
        isDD: function( /*String*/ DDString)
        {
            // summary:
            //    Test to see if a string is a DD coordinate pair format.
            // description:
            //    Tests DDString to see if it is DD coordinate pair format.
            // DDString: String
            //    String to test.
            // returns: boolean
            //    True if it meets DD coordinate pair format.

            return this._ddRegEx.test(DDString);
        },
        isDMS: function( /*String*/ DMSString)
        {
            // summary:
            //    Test to see if a string is in DMS coordinate pair format.
            // description:
            //    Tests if the specified string is in DMS coordinate pair format.
            // DMString: String
            //    String to test.
            // returns: boolean
            //    True if it meets DMS coordinate pair format.
            return this._dmsRegEx.test(DMSString) || this._dmsRegEx2.test(DMSString);
        },
        parseDMS: function( /*String*/ DMSString)
        {
            // summary:
            //    Parses a string into points.
            // description:
            //    Parses the given DMS coordinate pair format string into points.
            // DMSString: String
            //    String to parse.
            // returns: null|esri.geometry.Point[]
            //    Returns null if doens't pass !jsapix.geometry.isDMS(DMString) or if lat > 90 or long > 180 or lat min/sec >= 60 or long min/sec >= 60

            if (!this.isDMS(DMSString))
            {
                return null;
            }

            var ddParts, pts;
            if (this._dmsRegEx2.test(DMSString))
            {

                // rearrange to parse with standard dms regex
                pts = this._dmsRegEx2.exec(DMSString);
                ddParts = [];
                ddParts[1] = pts[1];
                ddParts[3] = pts[2];
                ddParts[5] = pts[3];
                ddParts[6] = parseFloat("0." + pts[5]);
                ddParts[8] = pts[6];
                ddParts[9] = pts[7];
                ddParts[11] = pts[8];
                ddParts[13] = pts[9];
                ddParts[14] = parseFloat("0." + pts[11]);
                ddParts[16] = pts[12];
            }

            if (!ddParts)
            {
                ddParts = this._dmsRegEx.exec(DMSString);
            }

            if (ddParts[3] >= 60 || ddParts[5] >= 60 || ddParts[11] >= 60 || ddParts[13] >= 60)
            {
                return null;
            }

            var numStr1 = ddParts[1] * 1;
            var numStr2 = ddParts[9] * 1;

            if (ddParts[8] && (ddParts[8].toUpperCase() === "N" || ddParts[8].toUpperCase() === "S"))
            {

                // if +/- are specified N/S cannot be
                if (ddParts[1].indexOf("+") === 0 || ddParts[1].indexOf("-") === 0)
                {
                    return null;
                }
                if (ddParts[8].toUpperCase() === "S")
                {
                    numStr1 = -1 * numStr1;
                }
            }
            var isNeg = numStr1 < 0 || ddParts[1].indexOf("-") === 0 || (ddParts[8] && ddParts[8].toUpperCase() === "S");
            numStr1 = numStr1 + (isNeg ? -1 : 1) * (ddParts[3] / 60) + (isNeg ? -1 : 1) * (parseInt(ddParts[5], 10) + (ddParts[6] && !isNaN(ddParts[6]) ? ddParts[6] : 0)) / 3600;

            if (ddParts[16] && (ddParts[16].toUpperCase() === "E" || ddParts[16].toUpperCase() === "W"))
            {

                // if +/- are specified E/W cannot be
                if (ddParts[9].indexOf("+") === 0 || ddParts[9].indexOf("-") === 0)
                {
                    return null;
                }
                if (ddParts[16].toUpperCase() === "W")
                {
                    numStr2 = -1 * numStr2;
                }
            }
            isNeg = numStr2 < 0 || ddParts[9].indexOf("-") === 0 || (ddParts[16] && ddParts[16].toUpperCase() === "W");
            numStr2 = numStr2 + (isNeg ? -1 : 1) * (ddParts[11] / 60) + (isNeg ? -1 : 1) * (parseInt(ddParts[13], 10) + (ddParts[14] && !isNaN(ddParts[14]) ? ddParts[14] : 0)) / 3600;

            if (numStr1 > 90 || numStr2 > 180)
            {
                return null;
            }

            return this.coordToPoints(numStr1, numStr2, true);
        },
        parseDD: function( /*String*/ DDString)
        {
            // summary:
            //    Parses a string into points.
            // description:
            //    Parses a decimal degree (DD) formated string into esri.geometry.Point objects.
            // DDString: String
            //    String to parse.
            // returns: null|esri.geometry.Point[]
            //    returns null if doens't pass !jsapix.geometry.isDD(DDString) or if lat > 90 or long > 180. Otherwise returns a point.

            if (!this.isDD(DDString))
            {
                return null; //null
            }

            var ddParts = this._ddRegEx.exec(DDString);

            var numStr1 = ddParts[1] + (ddParts[2] ? ddParts[2] : "");
            var numStr2 = ddParts[4] + (ddParts[5] ? ddParts[5] : "");

            if (ddParts[3] && (ddParts[3].toUpperCase() === "N" || ddParts[3].toUpperCase() === "S"))
            {
                //if +/- are specified N/S cannot be
                if (ddParts[1].indexOf("+") === 0 || ddParts[1].indexOf("-") === 0)
                {
                    return null;
                }
                if (ddParts[3].toUpperCase() === "S")
                {
                    numStr1 = -1 * numStr1;
                }
            }

            if (ddParts[6] && (ddParts[6].toUpperCase() === "E" || ddParts[6].toUpperCase() === "W"))
            {
                //if +/- are specified E/W cannot be
                if (ddParts[4].indexOf("+") === 0 || ddParts[4].indexOf("-") === 0)
                {
                    return null;
                }
                if (ddParts[6].toUpperCase() === "W")
                {
                    numStr2 = -1 * numStr2;
                }
            }

            if (numStr1 > 90 || numStr2 > 180 || numStr1 < -90 || numStr2 < -180)
            {
                return null; //null
            }

            return this.coordToPoints(numStr1, numStr2);
        },
        coordToPoints: function( /*Number*/ num1, /*Number*/ num2, /*Boolean*/ forceLatLonOnly)
        {
            // summary:
            //    Takes an x and y and returns an array of potential Points.
            // description:
            //    Takes an x and y and returns an array of potential Points.
            // num1: Number
            //    Potential coordinate x.
            // num2: Number
            //    Potential coordinate y.
            // returns: esri.geometry.Point[]
            //    Points that would be valid for x, y or y, x.

            var n1 = parseFloat(num1);
            var n2 = parseFloat(num2);

            var isLat = this.isValidLat;
            var isLon = this.isValidLon;

            if ((!isLat(n1) && !isLat(n2)) || !isLon(n1) || !isLon(n2))
            {
                return null;
            }

            var candidates = [];

            var pt1 = new Point(n1, n2, new SpatialReference(
            {
                wkid: 4326
            }));
            var pt2 = new Point(n2, n1, new SpatialReference(
            {
                wkid: 4326
            }));

            if (forceLatLonOnly)
            {
                candidates.push(pt2);
            }
            else
            {
                if (isLat(n1) && isLat(n2))
                {
                    candidates.push(pt2, pt1);
                }
                else if (!isLat(n1))
                {
                    candidates.push(pt1);
                }
                else if (!isLat(n2))
                {
                    candidates.push(pt2);
                }
            }

            return candidates;
        },
        isValidLat: function( /*Number*/ lat)
        {
            // summary:
            //    Determines if a number is a valid latitude.
            // description:
            //    Validates that lat is between (inclusive) 90 and -90.
            // lat: Number
            //    Lat to validate
            // returns: boolean
            //    True if lat <= 90 && lat >= -90.

            return (lat <= 90 && lat >= -90);
        },
        isValidLon: function( /*Number*/ lon)
        {
            // summary:
            //    Determines if a number is a valid longitude.
            // description:
            //    Validates that longitude is between (inclusive) 180 and -180.
            // lon: Number
            //    Lon to validate.
            // returns: boolean
            //    True if lon <= 180 && lon >= -180.

            return (lon <= 180 && lon >= -180);
        }
    });
});
