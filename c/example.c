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

typedef struct device_attribute_s {
    uint32_t attribute_id;
    const char* value;
} device_attribute_t;

typedef struct device_s {
    uint32_t attribute_count;
    device_attribute_t* attributes;
} device_t;

void serialize_device (pkt_serializer_t* serializer, device_t* device)
{
    pkt_serialize_uint32(serializer, device->attribute_count);
    for (uint32_t i = 0; i < device->attribute_count; i++) {
        pkt_serialize_uint32(serializer, device->attributes[i].attribute_id);
        pkt_serialize_zero_string(serializer, device->attributes[i].value);
    }
}

void parse_device (pkt_parser_t* parser, device_t* device)
{
    device->attribute_count = pkt_parse_uint32(parser);
    device->attributes = malloc(sizeof(device_attribute_t) * 3);
    for (uint32_t i = 0; i < device->attribute_count; i++) {
        device->attributes[i].attribute_id = pkt_parse_uint32(parser);
        device->attributes[i].value = pkt_parse_zero_string(parser);
    }
}

void free_device (device_t* device)
{
    free(device->attributes);
}

typedef struct frame_s {
    uint32_t type;
    uint32_t size;
} frame_t;

void serialize_frame (pkt_serializer_t* serializer, frame_t* frame)
{
    pkt_serialize_uint32(serializer, frame->type);
    pkt_serialize_uint32(serializer, frame->size);
}

void parse_frame (pkt_parser_t* parser, frame_t* frame)
{
    frame->type = pkt_parse_uint32(parser);
    frame->size = pkt_parse_uint32(parser);
}

void device_example ()
{
    pkt_serializer_t packet_serializer, frame_serializer;

    pkt_parser_t parser;

    device_attribute_t attributes_out[] = { { 1, "a" }, { 2, "b" }, { 3, "c" } };
    device_t device_out = { 3, attributes_out }, device_in;

    frame_t frame_out, frame_in;

    pkt_serializer_initialize(&packet_serializer);

    serialize_device(&packet_serializer, &device_out);

    pkt_serializer_allocate(&packet_serializer);

    serialize_device(&packet_serializer, &device_out);

    pkt_serializer_initialize(&frame_serializer);

    frame_out.type = 1;
    frame_out.size = packet_serializer.size;

    serialize_frame(&frame_serializer, &frame_out);

    pkt_serializer_allocate(&frame_serializer);

    serialize_frame(&frame_serializer, &frame_out);

    char* buffer = malloc(frame_serializer.size + packet_serializer.size);

    memcpy(buffer, frame_serializer.buffer, frame_serializer.size);
    memcpy(buffer + frame_serializer.size, packet_serializer.buffer, packet_serializer.size);

    pkt_serializer_free(&frame_serializer);
    pkt_serializer_free(&packet_serializer);

    pkt_parser_initialize(&parser, buffer);

    parse_frame(&parser, &frame_in);

    printf("type: %d, size: %d\n", frame_in.type, frame_in.size);

    pkt_parser_initialize(&parser, buffer + 8);

    switch (frame_in.type) {
    case 1:
        parse_device(&parser, &device_in);
        for (uint32_t i = 0; i < device_in.attribute_count; i++) {
            printf("attribute_id: %d, value: %s\n",
                device_in.attributes[i].attribute_id, device_in.attributes[i].value);
        }
        free_device(device);
        break;
    }
}

int main()
{
    const char foo[] = { 0xaa, 0xaa, 0xaa, 0xaa, 0x61, 0x00 };

    key_value_t key_value;

    pkt_serializer_t serializer;
    pkt_parser_t parser;

    pkt_parser_initialize(&parser, foo);

    parse_key_value(&parser, &key_value);

    printf("%x %s\n", key_value.key, key_value.value);

    pkt_serializer_initialize(&serializer);

    serialize_key_value(&serializer, &key_value);

    pkt_serializer_allocate(&serializer);

    serialize_key_value(&serializer, &key_value);

    pkt_parser_initialize(&parser, serializer.buffer);

    parse_key_value(&parser, &key_value);

    printf("%x %s\n", key_value.key, key_value.value);

    pkt_serializer_free(&serializer);

    device_example();

    return EXIT_SUCCESS;
}
