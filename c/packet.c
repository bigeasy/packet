#include "packet.h"
#include <strings.h>

void pkt_sizeof_uint32 (pkt_serializer_t* serializer, uint32_t value)
{
    serializer->size += 4;
}

void pkt_sizeof_zero_string (pkt_serializer_t* serializer, const char*  value)
{
    serializer->size += strlen(value) + 1;
}

static pkt_serializer_vtable_t PKT_SERIALIZER_SIZEOF =
{
    pkt_sizeof_uint32,
    pkt_sizeof_zero_string
};

void pkt_write_uint32 (pkt_serializer_t* serializer, uint32_t value)
{
    *serializer->offset = value >> 24 & 0xff;
    serializer->offset++;
    *serializer->offset = value >> 16 & 0xff;
    serializer->offset++;
    *serializer->offset = value >> 8 & 0xff;
    serializer->offset++;
    *serializer->offset = value & 0xff;
    serializer->offset++;
}

void pkt_write_zero_string (pkt_serializer_t* serializer, const char*  value)
{
    strcpy(serializer->offset, value);
    serializer->offset += strlen(serializer->offset) + 1;
}

static pkt_serializer_vtable_t PKT_SERIALIZER_SERIALIZE =
{
    pkt_write_uint32,
    pkt_write_zero_string
};

void pkt_serializer_initialize (pkt_serializer_t* serializer)
{
    serializer->size = 0;
    serializer->buffer = NULL;
    serializer->vtable = &PKT_SERIALIZER_SIZEOF;
}

void pkt_serializer_allocate (pkt_serializer_t* serializer)
{
    serializer->offset = serializer->buffer = malloc(serializer->size);
    serializer->vtable = &PKT_SERIALIZER_SERIALIZE;
}

void pkt_serializer_free (pkt_serializer_t* serializer)
{
    free(serializer->buffer);
}

const char* pkt_parse_zero_string (pkt_parser_t* parser)
{
    const char* value = parser->buffer;
    parser->buffer += strlen(parser->buffer) + 1;
    return value;
}

uint32_t pkt_parse_uint32 (pkt_parser_t* parser)
{
    uint32_t value =
            (parser->buffer[0] & 0xff) * 0x1000000 +
            (parser->buffer[1] & 0xff) * 0x10000 +
            (parser->buffer[2] & 0xff) * 0x100 +
            (parser->buffer[3]& 0xff) ;
    parser->buffer += 4;
    return value;
}

void pkt_parser_initialize (pkt_parser_t* parser, const char* buffer)
{
    parser->buffer = buffer;
}

void pkt_serialize_uint32 (pkt_serializer_t* serializer, uint32_t value)
{
    serializer->vtable->serialize_uint32(serializer, value);
}

void pkt_serialize_zero_string (pkt_serializer_t* serializer, const char* value)
{
    serializer->vtable->serialize_zero_string(serializer, value);
}

/* vim: set et */
