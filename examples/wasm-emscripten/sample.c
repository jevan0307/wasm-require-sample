#include <stdlib.h>
#include <time.h>
#include <math.h>
#include <emscripten/emscripten.h>

EMSCRIPTEN_KEEPALIVE
int fibonacci (int n) {
    if (n <= 0) {
        return 0;
    } else if (n == 1) {
        return 1;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}

EMSCRIPTEN_KEEPALIVE
double pi (int nPoints) {
    int i, inside = 0;
    double a, b;

    srand(time(NULL));
    for (i = 0; i < nPoints; i++) {
        a = (double)rand() / RAND_MAX;
        b = (double)rand() / RAND_MAX;
        if (a*a + b*b <= 1.0) {
            ++inside;
        }
    }
    return (double)inside / nPoints * 4.0;
}
