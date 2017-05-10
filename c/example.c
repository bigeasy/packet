#include <stdlib.h>
#include "packet.h"
#include <stdio.h>

typedef struct key_value_s {
    uint32_t key;
    const char* value;
} key_value_t;

void serialize_key_value (pkt_serializer_t* serializer, key_value_t* key_value)
{
    pkt_serialize_uint32(serializer, key_value->key);
    pkt_serialize_zero_string(serializer, key_value->value);
}

void parse_key_value (pkt_parser_t* parser, key_value_t* key_value)
{
    key_value->key = pkt_parse_uint32(parser);
    key_value->value = pkt_parse_zero_string(parser);
}

int main()
{
    const char foo[] = { 0xaa, 0xaa, 0xaa, 0xaa, 0x61, 0x00 };
    key_value_t key_value;

    pkt_serializer_t serializer;
    pkt_parser_t parser;

    pkt_parser_initialize(&parser, foo, sizeof(foo));

    parse_key_value(&parser, &key_value);

    printf("%x %s\n", key_value.key, key_value.value);

    pkt_serializer_initialize(&serializer);

    serialize_key_value(&serializer, &key_value);

    pkt_serializer_allocate(&serializer);

    serialize_key_value(&serializer, &key_value);

    pkt_parser_initialize(&parser, serializer.buffer, serializer.size);

    parse_key_value(&parser, &key_value);

    printf("%x %s\n", key_value.key, key_value.value);

    pkt_serializer_free(&serializer);

    return EXIT_SUCCESS;
}
