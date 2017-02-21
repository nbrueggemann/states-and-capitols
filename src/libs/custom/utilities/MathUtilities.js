define([
        "dojo/_base/declare"
    ],

    function(declare)
    {
        var MathUtilities = {
            /* Math Helpers */
            calculateDifference: function(numberA, numberB)
            {
                // Get min and max values
                // var min = Math.min(numberA, numberB);
                // var max = Math.max(numberA, numberB);
                // Get difference between min and max.
                var dif = Math.abs(numberA - numberB);
                return dif;
            },

            /**
             * num1 (required) = first number to compare
             * num2 (required) = second number to compare
             * precision (optional) = integer number of decimal places to consider
             *
             * Returns -1 if num1 < num2, 0 if num1 == num2, 1 if num1 > num2
             */
            compareNumbers: function(num1, num2, precision)
            {
                if (precision)
                {
                    // Chop the numbers to the correct precision
                    var multiplier = 10 * precision;
                    num1 = Math.round(num1 * multiplier) / multiplier;
                    num2 = Math.round(num2 * multiplier) / multiplier;
                }

                // Check for equality
                if (num1 === num2)
                {
                    return 0;
                }

                // Not equal, so check inequality
                return (num1 > num2) ? 1 : -1;
            },

            /**
             * Restricts the number of decimal dijits to a number
             *
             * number: the number to limit
             * scale: the maximum number of decimal dijits
             *
             * returns: the restricted number
             */
            restrictScale: function(number, scale)
            {
                // Limit decimal digits to scale
                var limitVal = Math.pow(10, scale);
                // console.log("limitVal: ", limitVal);
                number = Math.floor(number * limitVal) / limitVal;
                // console.log("number:", number);

                return number;
            },

            /**
             * Returns the maximum value of the provided array of numbers
             */
            maxOfArray: function(numbers)
            {
                var max = Number.NEGATIVE_INFINITY;

                for (var i = 0; i < numbers.length; i++)
                {
                    if (numbers[i] > max)
                    {
                        max = numbers[i];
                    }
                }

                return max;
            },

            /**
             * Returns the minimum value of the provided array of numbers
             */
            minOfArray: function(numbers)
            {
                var min = Number.POSITIVE_INFINITY;

                for (var i = 0; i < numbers.length; i++)
                {
                    if (numbers[i] < min)
                    {
                        min = numbers[i];
                    }
                }

                return min;
            }
        };
        var MathUtilitiesClass = declare("ngaBP/utilities/MathUtilities", null, MathUtilities);

        /* MathUtilities is a singleton class. */
        var _instance;
        if (!_instance)
        {
            _instance = new MathUtilitiesClass();
        }
        return _instance;
    });
