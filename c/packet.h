#include <stdint.h>
#include <stdlib.h>
#include <memory.h>

typedef struct pkt_serializer_s pkt_serializer_t;

typedef void (*pkt_serializer_uint32)(pkt_serializer_t*, uint32_t);
typedef void (*pkt_serializer_zero_string)(pkt_serializer_t*, const char*);

typedef struct {
    pkt_serializer_uint32           serialize_uint32;
    pkt_serializer_zero_string      serialize_zero_string;
} pkt_serializer_vtable_t;

struct pkt_serializer_s {
    size_t size;
    char* buffer;
    char* offset;
    const pkt_serializer_vtable_t*  vtable;
};

typedef struct pkt_parser_s {
    const char* buffer;
    size_t size;
} pkt_parser_t;

const char* pkt_parse_zero_string (pkt_parser_t*);
uint32_t pkt_parse_uint32 (pkt_parser_t*);

void pkt_parser_initialize(pkt_parser_t*, const char*);

void pkt_serializer_initialize (pkt_serializer_t*);
void pkt_serializer_allocate (pkt_serializer_t*);
void pkt_serializer_free (pkt_serializer_t*);
void pkt_serialize_uint32 (pkt_serializer_t*, uint32_t);
void pkt_serialize_zero_string (pkt_serializer_t*, const char*);

/* vim: set et */
