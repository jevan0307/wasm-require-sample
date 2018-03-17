function fibonacci (n) {
    if (n <= 0) {
        return 0;
    } else if (n == 1) {
        return 1;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}

function pi (nPoints) {
   var a, b, inside = 0;
    for (var i = 0; i < nPoints; i++) {
        a = Math.random();
        b = Math.random();
        if (a*a + b*b <= 1.0) {
           ++inside;
        }
    }
    return inside / nPoints * 4.0;
}

exports.fibonacci = fibonacci;
exports.pi = pi;
