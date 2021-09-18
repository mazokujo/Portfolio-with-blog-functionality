//this function handles async function errors, it wrap around async function to simplify syntax;
module.exports = function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}

// Here is another way to type the wrapAsync function:
// module.exports = func => {
//     return (req, res, next) => {
//         func(req, res, next).catch(next)
//     }
// }

