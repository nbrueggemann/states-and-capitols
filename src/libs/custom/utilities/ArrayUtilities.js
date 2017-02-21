define([
        "dojo/_base/declare",
        "dojo/_base/array",
        "dojo/_base/lang",

        "libs/custom/utilities/MathUtilities"
    ],

    function(declare, dojoArray, lang, MathUtilities)
    {

        var ArrayUtilities = {
            /// <summary>
            /// Returns the first item found with the given propertyName and value combination.
            /// If exactMatch is true, the comparison checks value and type (===), if false (default) only value is checked (==)
            /// If precision is specified, a numeric comparison is assumed. This will limit decimal comparisons to the specified precision.
            /// </summary>
            /// <param name="array"></param>
            /// <param name="propertyName"></param>
            /// <param name="value"></param>
            /// <param name="exactMatch"></param>
            /// <param name="precision"></param>
            /// <returns type=""></returns>
            indexOfByProperty: function(array, propertyName, value, exactMatch, precision)
            {
                var idx = -1;
                dojoArray.some(array, function(item, i)
                {
                    var testValue = item[propertyName];
                    var match = false;
                    if (precision)
                    {
                        // this is a numeric comparison
                        match = (MathUtilities.compareNumbers(value, testValue, precision) === 0);
                    }
                    else
                    {
                        // every other kind of comparison
                        match = (exactMatch) ? value === testValue : value === testValue;
                    }

                    if (match)
                    {
                        // Got a match, save the index
                        idx = i;
                    }

                    return match;
                });

                return idx;
            },

            /**
             * summary: Performs a binary search over an array for a value. Assumes that the array is already sorted
             * by the property the comparator will be testing. THIS WILL NOT WORK ON AN UNSORTED ARRAY!
             *
             * parameters:
             * array: the SORTED array we wish to search
             * value: the value we are searching for
             * propertyName (optional): If array elements are objects, this is the property that will be searched
             * exactMatch (optional): whether we are using an exact match (===) or just match (==) in comparison
             * precision (optional): decimal precision for numeric search. Assumes search is for number value.
             *
             * return: index of the found item or -1 if not found
             */
            indexOfBinarySearch: function(array, value, propertyName, exactMatch, precision)
            {
                if (!array || array.length === 0)
                {
                    return -1;
                }

                var minIdx = 0;
                var maxIdx = array.length - 1;
                var midIdx = 0;
                var midValue = 0;

                while (minIdx <= maxIdx)
                {
                    midIdx = minIdx + (Math.floor((maxIdx - minIdx) / 2));
                    midValue = (propertyName) ? array[midIdx][propertyName] : array[minIdx];

                    var compResult = 0;
                    if (precision)
                    {
                        // this is a numeric comparison
                        compResult = MathUtilities.compareNumbers(value, midValue, precision);
                    }
                    else
                    {
                        // every other kind of comparison
                        var match = (exactMatch) ? value === midValue : value === midValue;
                        if (match)
                        {
                            compResult = 0;
                        }
                        else
                        {
                            compResult = (value > midValue) ? 1 : -1;
                        }
                    }

                    if (compResult === 1)
                    {
                        // the value is in the upper half
                        minIdx = midIdx;
                    }
                    else if (compResult === -1)
                    {
                        // the value is in the lower half
                        maxIdx = midIdx;
                    }
                    else
                    {
                        // found the value. Return the index
                        return midIdx;
                    }
                }

                // didn't find the value
                return -1;
            },

            /// <summary>
            /// Returns the first item found with the given propertyName and propertyValue combination.
            /// If exactMatch is true, the comparison checks value and type (===), if false (default) only value is checked (==)
            /// </summary>
            /// <param name="array"></param>
            /// <param name="propertyName"></param>
            /// <param name="propertyValue"></param>
            /// <param name="exactMatch"></param>
            /// <returns type=""></returns>
            findItemByProperty: function(array, propertyName, propertyValue, exactMatch)
            {
                var result = null;
                dojoArray.some(array, function(item)
                {
                    var value = item[propertyName];
                    var match = (exactMatch) ? value === propertyValue : value === propertyValue;
                    if (match)
                    {
                        result = item;
                    }
                    return match;
                });
                return result;
            },
            /// <summary>
            /// Returns all the items found with the given propertyName and propertyValue combination.
            /// </summary>
            /// <param name="array"></param>
            /// <param name="propertyName"></param>
            /// <param name="propertyValue"></param>
            /// <returns type=""></returns>
            findItemsByProperty: function(array, propertyName, propertyValue)
            {
                var results = array.filter(array, function(item)
                {
                    return item[propertyName] === propertyValue;
                });
                return results;
            },
            /// <summary>
            /// Searches an array of strings for a string that starts with a given prefix.
            ///Returns the first string found that matches the given prefix.
            /// </summary>
            findValueByPrefix: function(array, prefix)
            {
                var foundString;
                dojoArray.some(array, function(string)
                {
                    var isFound = string.indexOf(prefix) === 0;
                    if (isFound)
                    {
                        foundString = string;
                    }
                    return isFound;
                });
                return foundString;
            },
            /// <summary>
            /// Returns an array with all the properties of the given object in the array.
            /// If field is passed in, the array will contain only value from the field property.
            /// </summary>
            createArrayFromObject: function(object, field)
            {
                var returnArray = [];
                var property;
                if (field)
                {
                    for (property in object)
                    {
                        if (property === field)
                        {
                            returnArray.push(object[property]);
                            break;
                        }
                    }
                }
                else
                {
                    for (property in object)
                    {
                        if (object.hasOwnProperty(property))
                        {
                            returnArray.push(object[property]);
                        }
                    }
                }

                return returnArray;
            },
            /// <summary>
            /// Add the item to the array.  Prevents duplicate items being added to the array by default.
            /// Returns true if the item was added to the array.  False if it was not.
            /// </summary>
            /// <param name="array"></param>
            /// <param name="item"></param>
            /// <param name="allowDuplicates"></param>
            /// <returns type="boolean"></returns>
            addItem: function(array, item, allowDuplicates)
            {
                if (lang.isArray(array))
                {
                    // Only add the item if allowDuplicates is true or the item is not already in the array.
                    if (allowDuplicates || dojoArray.indexOf(array, item) === -1)
                    {
                        array.push(item);
                        return true;
                    }
                }
                return false;
            },
            addObject: function(array, object, keyPropertyName, allowDuplicates)
            {
                if (lang.isArray(array))
                {
                    // Only add the object if allowDuplicates is true or the object[keyPropertyName] is not already in the array.
                    if (allowDuplicates || !this.findItemByProperty(array, keyPropertyName, object[keyPropertyName], true))
                    {
                        array.push(object);
                        return true;
                    }
                }
                return false;
            },

            /// <summary>
            /// Performs a shallow clone of an array.
            /// </summary>
            /// <param name="arrayToClone"></param>
            /// <returns type="array"></returns>
            clone: function(arrayToClone)
            {
                return arrayToClone.slice(0);
            },

            /// <summary>
            /// concats 2 arrays.  Prevents duplicate items being added to the array by default.
            /// </summary>
            /// <param name="array1"></param>
            /// <param name="array2"></param>
            /// <param name="allowDuplicates"></param>
            /// <returns type="array"></returns>
            concat: function(array1, array2, allowDuplicates)
            {
                // Make sure array1 is an array.
                if (array1 instanceof Array)
                {
                    var returnArray = array1.concat();

                    dojoArray.forEach(array2, function(item, i, a)
                    {
                        // Only add the item if allowDuplicates is true or the item is not already in the array.
                        if (allowDuplicates || dojoArray.indexOf(array1, item) === -1)
                        {
                            returnArray.push(item);
                        }
                    });

                    return returnArray;
                }
            },
            /// <summary>
            /// checks if item is in an array.
            /// </summary>
            /// <param name="array"></param>
            /// <param name="item"></param>
            /// <returns type="boolean"></returns>
            contains: function(array, item)
            {
                return dojoArray.indexOf(array, item) >= 0;
            },
            /// <summary>
            /// Removes the item from the array.
            /// Returns true if the item was found in the array, false if the item was not found.
            /// </summary>
            /// <param name="array"></param>
            /// <param name="item"></param>
            /// <returns type="boolean"></returns>
            removeItem: function(array, item)
            {
                if (lang.isArray(array))
                {
                    var i = dojoArray.indexOf(array, item);
                    if (i > -1)
                    {
                        array.splice(i, 1);
                        return true;
                    }
                }
                return false;
            },
            sortByProperty: function(array, propertyName, sortDescending, isCaseSensitive, sortCopy)
            {
                var sortArray = sortCopy ? this.clone(array) : array;

                sortArray.sort(function(a, b)
                {
                    var textA = a[propertyName];
                    var textB = b[propertyName];
                    var retValue;

                    if (textA && textB)
                    {
                        if (!isCaseSensitive && textA.toUpperCase && textB.toUpperCase)
                        {
                            textA = textA.toUpperCase();
                            textB = textB.toUpperCase();
                        }

                        if (!sortDescending)
                        {
                            retValue = (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                            // ascending - default
                        }
                        else
                        {
                            // descending
                            retValue = (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
                        }

                        return retValue;
                    }
                });
                if (sortCopy)
                {
                    return sortArray;
                }
            },
            /// Sorts an array of numbers
            sortNumbers: function(arrayOfNumbers, descending)
            {
                arrayOfNumbers.sort(function(a, b)
                {
                    if (descending)
                    {
                        return b - a;
                    }
                    return a - b;
                });
            },
            join: function(array, delimeter, wrapper)
            {
                var joinedString = null;
                if (array && array.length)
                {
                    delimeter = delimeter || ",";
                    wrapper = wrapper || "";
                    joinedString = wrapper + array.join(wrapper + delimeter + wrapper) + wrapper;
                }
                return joinedString;
            },
            getMinValue: function(array)
            {
                array.sort();
                var min = array[0];
                return min;
            },
            getMaxValue: function(array)
            {
                array.sort();
                var max = array[array.length - 1];
                return max;
            }
        };
        var ArrayUtilitiesClass = declare("utilities/ArrayUtilities", null, ArrayUtilities);

        /* ObjectUtilities is a singleton class. */
        var _instance;
        if (!_instance)
        {
            _instance = new ArrayUtilitiesClass();
        }
        return _instance;
    });
