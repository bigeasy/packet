#include <stdio.h>
#include <stdlib.h>

int
write(const char * filename, void * data, int length)
{
    FILE *out;
    if (!(out = fopen(filename, "w"))) {
        printf("ERROR writing %s.", filename);
        exit(1);
    }
    fwrite(data, length, 1, out);
    fclose(out);
    return 0;
}

int
main()
{
    char n8[] = { 127,  1, 0, -1, -2, -128 }; 
    unsigned char un8[] = { 255, 1, 0 };
    double n64d[] = { -9.1819281981e3, -10, -0.11, 0, 0.11, 10 };
    unsigned short int u16[] = { 65535, 65534, 1, 0 };
    short int n16[] = { 32767, 128, 1, 0, -1, -129, -32768 };
    write("vows/examples/n8", &un8, sizeof(un8));
    write("vows/examples/-n8", &n8, sizeof(n8));
    write("vows/examples/u16", &u16, sizeof(u16));
    write("vows/examples/n16", &n16, sizeof(n16));
    write("vows/examples/n64d", &n64d, sizeof(n64d));
}
