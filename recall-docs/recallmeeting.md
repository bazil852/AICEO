List Recordings

# List Recordings

The base rate limit for this endpoint is:
- 60 requests per min per workspace

# OpenAPI definition

```json
{
  "openapi": "3.0.3",
  "info": {
    "title": "Recall.ai API",
    "version": "0.0.0",
    "description": "Recall.ai API Documentation"
  },
  "paths": {
    "/api/v1/recording/": {
      "get": {
        "operationId": "recording_list",
        "summary": "List Recordings",
        "parameters": [
          {
            "in": "query",
            "name": "bot_id",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "in": "query",
            "name": "created_at_after",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "in": "query",
            "name": "created_at_before",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "cursor",
            "required": false,
            "in": "query",
            "description": "The pagination cursor value.",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "desktop_sdk_upload_id",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "in": "query",
            "name": "status_code",
            "schema": {
              "type": "string",
              "nullable": true,
              "enum": [
                "done",
                "failed",
                "paused",
                "processing"
              ]
            },
            "description": "* `processing` - Processing\n* `paused` - Paused\n* `done` - Done\n* `failed` - Failed"
          }
        ],
        "tags": [
          "recording"
        ],
        "security": [
          {
            "tokenAuth": []
          }
        ],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PaginatedRecordingList"
                }
              }
            },
            "description": ""
          }
        },
        "x-throttles": [
          {
            "scope_key": "workspace_id",
            "limit": 60,
            "period": "min"
          }
        ],
        "description": "The base rate limit for this endpoint is:\n- 60 requests per min per workspace"
      }
    }
  },
  "components": {
    "schemas": {
      "ArtifactStatus": {
        "type": "object",
        "properties": {
          "code": {
            "$ref": "#/components/schemas/ArtifactStatusCodeEnum"
          },
          "sub_code": {
            "type": "string",
            "nullable": true
          },
          "updated_at": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": [
          "code",
          "sub_code",
          "updated_at"
        ]
      },
      "ArtifactStatusCodeEnum": {
        "enum": [
          "processing",
          "done",
          "failed",
          "deleted"
        ],
        "type": "string",
        "description": "* `processing` - Processing\n* `done` - Done\n* `failed` - Failed\n* `deleted` - Deleted"
      },
      "AudioMixedArtifactData": {
        "type": "object",
        "properties": {
          "download_url": {
            "type": "string",
            "format": "uri",
            "readOnly": true,
            "nullable": true
          }
        },
        "required": [
          "download_url"
        ]
      },
      "AudioMixedArtifactShortcut": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "readOnly": true
          },
          "created_at": {
            "type": "string",
            "format": "date-time",
            "readOnly": true
          },
          "status": {
            "allOf": [
              {
                "$ref": "#/components/schemas/ArtifactStatus"
              }
            ],
            "readOnly": true
          },
          "metadata": {
            "type": "object",
            "additionalProperties": {
              "type": "string"
            }
          },
          "data": {
            "allOf": [
              {
                "$ref": "#/components/schemas/AudioMixedArtifactData"
              }
            ],
            "readOnly": true
          },
          "format": {
            "allOf": [
              {
                "$ref": "#/components/schemas/Format33bEnum"
              }
            ],
            "readOnly": true,
            "description": "Format of the mixed audio file\n\n* `mp3` - Mp3\n* `raw` - Raw"
          }
        },
        "required": [
          "created_at",
          "data",
          "format",
          "id",
          "metadata",
          "status"
        ]
      },
      "BotMinimal": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "readOnly": true
          },
          "metadata": {
            "type": "object",
            "additionalProperties": {
              "type": "string",
              "nullable": true
            }
          }
        },
        "required": [
          "id",
          "metadata"
        ]
      },
      "DesktopSdkUploadMinimal": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "readOnly": true
          },
          "metadata": {
            "type": "object",
            "additionalProperties": {
              "type": "string",
              "nullable": true
            }
          }
        },
        "required": [
          "id",
          "metadata"
        ]
      },
      "Format33bEnum": {
        "enum": [
          "mp3",
          "raw"
        ],
        "type": "string",
        "description": "* `mp3` - Mp3\n* `raw` - Raw"
      },
      "Format3b3Enum": {
        "enum": [
          "mp4"
        ],
        "type": "string",
        "description": "* `mp4` - Mp4"
      },
      "LanguageCodeC40Enum": {
        "enum": [
          "auto",
          "bg",
          "ca",
          "cs",
          "da",
          "de",
          "el",
          "en",
          "en_au",
          "en_uk",
          "en_us",
          "es",
          "et",
          "fi",
          "fr",
          "he",
          "hi",
          "hr",
          "hu",
          "id",
          "it",
          "ja",
          "ko",
          "lt",
          "lv",
          "ms",
          "nl",
          "no",
          "pl",
          "pt",
          "ro",
          "ru",
          "sk",
          "sv",
          "th",
          "tr",
          "uk",
          "vi",
          "zh"
        ],
        "type": "string",
        "description": "* `auto` - auto\n* `bg` - bg\n* `ca` - ca\n* `cs` - cs\n* `da` - da\n* `de` - de\n* `el` - el\n* `en` - en\n* `en_au` - en_au\n* `en_uk` - en_uk\n* `en_us` - en_us\n* `es` - es\n* `et` - et\n* `fi` - fi\n* `fr` - fr\n* `he` - he\n* `hi` - hi\n* `hr` - hr\n* `hu` - hu\n* `id` - id\n* `it` - it\n* `ja` - ja\n* `ko` - ko\n* `lt` - lt\n* `lv` - lv\n* `ms` - ms\n* `nl` - nl\n* `no` - no\n* `pl` - pl\n* `pt` - pt\n* `ro` - ro\n* `ru` - ru\n* `sk` - sk\n* `sv` - sv\n* `th` - th\n* `tr` - tr\n* `uk` - uk\n* `vi` - vi\n* `zh` - zh"
      },
      "MeetingMetadataArtifactData": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string",
            "readOnly": true,
            "nullable": true
          },
          "zoom": {
            "allOf": [
              {
                "$ref": "#/components/schemas/MeetingMetadataArtifactDataZoom"
              }
            ],
            "readOnly": true,
            "nullable": true
          }
        },
        "required": [
          "title",
          "zoom"
        ]
      },
      "MeetingMetadataArtifactDataZoom": {
        "type": "object",
        "properties": {
          "meeting_uuid": {
            "type": "string",
            "nullable": true
          }
        },
        "required": [
          "meeting_uuid"
        ]
      },
      "MeetingMetadataArtifactShortcut": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "readOnly": true
          },
          "created_at": {
            "type": "string",
            "format": "date-time",
            "readOnly": true
          },
          "status": {
            "allOf": [
              {
                "$ref": "#/components/schemas/ArtifactStatus"
              }
            ],
            "readOnly": true
          },
          "metadata": {
            "type": "object",
            "additionalProperties": {
              "type": "string"
            }
          },
          "data": {
            "allOf": [
              {
                "$ref": "#/components/schemas/MeetingMetadataArtifactData"
              }
            ],
            "readOnly": true
          }
        },
        "required": [
          "created_at",
          "data",
          "id",
          "metadata",
          "status"
        ]
      },
      "PaginatedRecordingList": {
        "type": "object",
        "properties": {
          "next": {
            "type": "string",
            "nullable": true
          },
          "previous": {
            "type": "string",
            "nullable": true
          },
          "results": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Recording"
            }
          }
        }
      },
      "ParticipantEventsArtifactData": {
        "type": "object",
        "properties": {
          "participant_events_download_url": {
            "type": "string",
            "format": "uri",
            "readOnly": true,
            "nullable": true,
            "description": "Download all participant events for the recording. **[See response format here](https://docs.recall.ai/docs/download-schemas#json-participant-event-download-url)**"
          },
          "speaker_timeline_download_url": {
            "type": "string",
            "format": "uri",
            "readOnly": true,
            "nullable": true,
            "description": "Download speaker timeline for the recording. **[See response format here](https://docs.recall.ai/docs/download-schemas#json-speaker-timeline-download-url)**"
          },
          "participants_download_url": {
            "type": "string",
            "format": "uri",
            "readOnly": true,
            "nullable": true,
            "description": "Download all participants for the recording. **[See response format here](https://docs.recall.ai/docs/download-schemas#json-participant-download-url)**"
          }
        },
        "required": [
          "participant_events_download_url",
          "participants_download_url",
          "speaker_timeline_download_url"
        ]
      },
      "ParticipantEventsArtifactShortcut": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "readOnly": true
          },
          "created_at": {
            "type": "string",
            "format": "date-time",
            "readOnly": true
          },
          "status": {
            "allOf": [
              {
                "$ref": "#/components/schemas/ArtifactStatus"
              }
            ],
            "readOnly": true
          },
          "metadata": {
            "type": "object",
            "additionalProperties": {
              "type": "string"
            }
          },
          "data": {
            "allOf": [
              {
                "$ref": "#/components/schemas/ParticipantEventsArtifactData"
              }
            ],
            "readOnly": true
          }
        },
        "required": [
          "created_at",
          "data",
          "id",
          "metadata",
          "status"
        ]
      },
      "RealtimeEndpointMinimal": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "readOnly": true
          },
          "metadata": {
            "type": "object",
            "additionalProperties": {
              "type": "string",
              "nullable": true
            }
          }
        },
        "required": [
          "id",
          "metadata"
        ]
      },
      "RecallaiSpellingEntry": {
        "type": "object",
        "properties": {
          "find": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "Find any of these items in the source transcript"
          },
          "replace": {
            "type": "string",
            "description": "Replace found matches with this exact string (will not change case)"
          }
        },
        "required": [
          "find",
          "replace"
        ]
      },
      "RecallaiStreamingTranscription": {
        "type": "object",
        "properties": {
          "language_code": {
            "allOf": [
              {
                "$ref": "#/components/schemas/LanguageCodeC40Enum"
              }
            ],
            "default": "auto",
            "description": "Must be `en` in low latency mode. Docs: https://docs.recall.ai/docs/recallai-transcription\n\n* `auto` - auto\n* `bg` - bg\n* `ca` - ca\n* `cs` - cs\n* `da` - da\n* `de` - de\n* `el` - el\n* `en` - en\n* `en_au` - en_au\n* `en_uk` - en_uk\n* `en_us` - en_us\n* `es` - es\n* `et` - et\n* `fi` - fi\n* `fr` - fr\n* `he` - he\n* `hi` - hi\n* `hr` - hr\n* `hu` - hu\n* `id` - id\n* `it` - it\n* `ja` - ja\n* `ko` - ko\n* `lt` - lt\n* `lv` - lv\n* `ms` - ms\n* `nl` - nl\n* `no` - no\n* `pl` - pl\n* `pt` - pt\n* `ro` - ro\n* `ru` - ru\n* `sk` - sk\n* `sv` - sv\n* `th` - th\n* `tr` - tr\n* `uk` - uk\n* `vi` - vi\n* `zh` - zh"
          },
          "spelling": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/RecallaiSpellingEntry"
            },
            "description": "List of text strings to find/replace in the transcript."
          },
          "key_terms": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "Increases the chances that these terms appear in the transcript over some sound-alikes."
          },
          "filter_profanity": {
            "type": "boolean",
            "default": false
          },
          "mode": {
            "allOf": [
              {
                "$ref": "#/components/schemas/RecallaiStreamingTranscriptionModeEnum"
              }
            ],
            "default": "prioritize_accuracy",
            "description": "The mode of the transcription algorithm. If you just want the transcript very quickly after the call is over, use `prioritize_accuracy`. If you need the words on realtime endpoints within seconds of utterance, use `prioritize_low_latency`, with the caveat that most features are unsupported in low latency mode.\n\n* `prioritize_low_latency` - prioritize_low_latency\n* `prioritize_accuracy` - prioritize_accuracy"
          }
        }
      },
      "RecallaiStreamingTranscriptionModeEnum": {
        "enum": [
          "prioritize_low_latency",
          "prioritize_accuracy"
        ],
        "type": "string",
        "description": "* `prioritize_low_latency` - prioritize_low_latency\n* `prioritize_accuracy` - prioritize_accuracy"
      },
      "Recording": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "readOnly": true
          },
          "created_at": {
            "type": "string",
            "format": "date-time",
            "readOnly": true
          },
          "started_at": {
            "type": "string",
            "format": "date-time",
            "readOnly": true,
            "nullable": true
          },
          "completed_at": {
            "type": "string",
            "format": "date-time",
            "readOnly": true,
            "nullable": true
          },
          "status": {
            "allOf": [
              {
                "$ref": "#/components/schemas/RecordingStatus"
              }
            ],
            "readOnly": true
          },
          "media_shortcuts": {
            "allOf": [
              {
                "$ref": "#/components/schemas/RecordingShortcuts"
              }
            ],
            "readOnly": true
          },
          "realtime_endpoints": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/RealtimeEndpointMinimal"
            },
            "readOnly": true
          },
          "bot": {
            "allOf": [
              {
                "$ref": "#/components/schemas/BotMinimal"
              }
            ],
            "readOnly": true,
            "nullable": true
          },
          "desktop_sdk_upload": {
            "allOf": [
              {
                "$ref": "#/components/schemas/DesktopSdkUploadMinimal"
              }
            ],
            "readOnly": true,
            "nullable": true
          },
          "expires_at": {
            "type": "string",
            "format": "date-time",
            "readOnly": true
          },
          "metadata": {
            "type": "object",
            "additionalProperties": {
              "type": "string"
            }
          }
        },
        "required": [
          "bot",
          "completed_at",
          "created_at",
          "desktop_sdk_upload",
          "expires_at",
          "id",
          "media_shortcuts",
          "metadata",
          "realtime_endpoints",
          "started_at",
          "status"
        ]
      },
      "RecordingShortcuts": {
        "type": "object",
        "properties": {
          "video_mixed": {
            "allOf": [
              {
                "$ref": "#/components/schemas/VideoMixedArtifactShortcut"
              }
            ],
            "readOnly": true,
            "nullable": true
          },
          "transcript": {
            "allOf": [
              {
                "$ref": "#/components/schemas/TranscriptArtifactShortcut"
              }
            ],
            "readOnly": true,
            "nullable": true
          },
          "participant_events": {
            "allOf": [
              {
                "$ref": "#/components/schemas/ParticipantEventsArtifactShortcut"
              }
            ],
            "readOnly": true,
            "nullable": true
          },
          "meeting_metadata": {
            "allOf": [
              {
                "$ref": "#/components/schemas/MeetingMetadataArtifactShortcut"
              }
            ],
            "readOnly": true,
            "nullable": true
          },
          "audio_mixed": {
            "allOf": [
              {
                "$ref": "#/components/schemas/AudioMixedArtifactShortcut"
              }
            ],
            "readOnly": true,
            "nullable": true
          }
        },
        "required": [
          "audio_mixed",
          "meeting_metadata",
          "participant_events",
          "transcript",
          "video_mixed"
        ]
      },
      "RecordingStatus": {
        "type": "object",
        "properties": {
          "code": {
            "$ref": "#/components/schemas/RecordingStatusCodeEnum"
          },
          "sub_code": {
            "type": "string",
            "nullable": true
          },
          "updated_at": {
            "type": "string",
            "format": "date-time"
          }
        },
        "required": [
          "code",
          "sub_code",
          "updated_at"
        ]
      },
      "RecordingStatusCodeEnum": {
        "enum": [
          "processing",
          "paused",
          "done",
          "failed",
          "deleted"
        ],
        "type": "string",
        "description": "* `processing` - Processing\n* `paused` - Paused\n* `done` - Done\n* `failed` - Failed\n* `deleted` - Deleted"
      },
      "TranscriptArtifactData": {
        "type": "object",
        "properties": {
          "download_url": {
            "type": "string",
            "format": "uri",
            "readOnly": true,
            "nullable": true,
            "description": "Download transcript for the recording. **[See response format here](https://docs.recall.ai/docs/download-schemas#json-transcript-download-url)**"
          },
          "provider_data_download_url": {
            "type": "string",
            "format": "uri",
            "readOnly": true,
            "nullable": true,
            "description": "Download raw transcription data received from the provider for the recording. **[See response format here](https://docs.recall.ai/docs/download-schemas#json-transcript-provider-data-download-url)**"
          }
        },
        "required": [
          "download_url",
          "provider_data_download_url"
        ]
      },
      "TranscriptArtifactDiarization": {
        "type": "object",
        "properties": {
          "use_separate_streams_when_available": {
            "type": "boolean",
            "readOnly": true
          }
        },
        "required": [
          "use_separate_streams_when_available"
        ]
      },
      "TranscriptArtifactProvider": {
        "type": "object",
        "properties": {
          "assembly_ai_async": {
            "properties": {
              "language_code": {
                "x-label": "Language code",
                "description": "The language of your audio file. Possible values are found in [Supported Languages](https://www.assemblyai.com/docs/concepts/supported-languages).\nThe default value is 'en_us'.\n",
                "oneOf": [
                  {
                    "anyOf": [
                      {
                        "x-label": "Language code",
                        "type": "string",
                        "description": "The language of your audio file. Possible values are found in [Supported Languages](https://www.assemblyai.com/docs/concepts/supported-languages).\nThe default value is 'en_us'.\n",
                        "x-fern-sdk-group-name": "transcripts",
                        "enum": [
                          "en",
                          "en_au",
                          "en_uk",
                          "en_us",
                          "es",
                          "fr",
                          "de",
                          "it",
                          "pt",
                          "nl",
                          "af",
                          "sq",
                          "am",
                          "ar",
                          "hy",
                          "as",
                          "az",
                          "ba",
                          "eu",
                          "be",
                          "bn",
                          "bs",
                          "br",
                          "bg",
                          "my",
                          "ca",
                          "zh",
                          "hr",
                          "cs",
                          "da",
                          "et",
                          "fo",
                          "fi",
                          "gl",
                          "ka",
                          "el",
                          "gu",
                          "ht",
                          "ha",
                          "haw",
                          "he",
                          "hi",
                          "hu",
                          "is",
                          "id",
                          "ja",
                          "jw",
                          "kn",
                          "kk",
                          "km",
                          "ko",
                          "lo",
                          "la",
                          "lv",
                          "ln",
                          "lt",
                          "lb",
                          "mk",
                          "mg",
                          "ms",
                          "ml",
                          "mt",
                          "mi",
                          "mr",
                          "mn",
                          "ne",
                          "no",
                          "nn",
                          "oc",
                          "pa",
                          "ps",
                          "fa",
                          "pl",
                          "ro",
                          "ru",
                          "sa",
                          "sr",
                          "sn",
                          "sd",
                          "si",
                          "sk",
                          "sl",
                          "so",
                          "su",
                          "sw",
                          "sv",
                          "tl",
                          "tg",
                          "ta",
                          "tt",
                          "te",
                          "th",
                          "bo",
                          "tr",
                          "tk",
                          "uk",
                          "ur",
                          "uz",
                          "vi",
                          "cy",
                          "yi",
                          "yo"
                        ],
                        "x-aai-enum": {
                          "en": {
                            "label": "English (global)"
                          },
                          "en_au": {
                            "label": "English (Australian)"
                          },
                          "en_uk": {
                            "label": "English (British)"
                          },
                          "en_us": {
                            "label": "English (US)"
                          },
                          "es": {
                            "label": "Spanish"
                          },
                          "fr": {
                            "label": "French"
                          },
                          "de": {
                            "label": "German"
                          },
                          "it": {
                            "label": "Italian"
                          },
                          "pt": {
                            "label": "Portuguese"
                          },
                          "nl": {
                            "label": "Dutch"
                          },
                          "af": {
                            "label": "Afrikaans"
                          },
                          "sq": {
                            "label": "Albanian"
                          },
                          "am": {
                            "label": "Amharic"
                          },
                          "ar": {
                            "label": "Arabic"
                          },
                          "hy": {
                            "label": "Armenian"
                          },
                          "as": {
                            "label": "Assamese"
                          },
                          "az": {
                            "label": "Azerbaijani"
                          },
                          "ba": {
                            "label": "Bashkir"
                          },
                          "eu": {
                            "label": "Basque"
                          },
                          "be": {
                            "label": "Belarusian"
                          },
                          "bn": {
                            "label": "Bengali"
                          },
                          "bs": {
                            "label": "Bosnian"
                          },
                          "br": {
                            "label": "Breton"
                          },
                          "bg": {
                            "label": "Bulgarian"
                          },
                          "my": {
                            "label": "Burmese"
                          },
                          "ca": {
                            "label": "Catalan"
                          },
                          "zh": {
                            "label": "Chinese"
                          },
                          "hr": {
                            "label": "Croatian"
                          },
                          "cs": {
                            "label": "Czech"
                          },
                          "da": {
                            "label": "Danish"
                          },
                          "et": {
                            "label": "Estonian"
                          },
                          "fo": {
                            "label": "Faroese"
                          },
                          "fi": {
                            "label": "Finnish"
                          },
                          "gl": {
                            "label": "Galician"
                          },
                          "ka": {
                            "label": "Georgian"
                          },
                          "el": {
                            "label": "Greek"
                          },
                          "gu": {
                            "label": "Gujarati"
                          },
                          "ht": {
                            "label": "Haitian"
                          },
                          "ha": {
                            "label": "Hausa"
                          },
                          "haw": {
                            "label": "Hawaiian"
                          },
                          "he": {
                            "label": "Hebrew"
                          },
                          "hi": {
                            "label": "Hindi"
                          },
                          "hu": {
                            "label": "Hungarian"
                          },
                          "is": {
                            "label": "Icelandic"
                          },
                          "id": {
                            "label": "Indonesian"
                          },
                          "ja": {
                            "label": "Japanese"
                          },
                          "jw": {
                            "label": "Javanese"
                          },
                          "kn": {
                            "label": "Kannada"
                          },
                          "kk": {
                            "label": "Kazakh"
                          },
                          "km": {
                            "label": "Khmer"
                          },
                          "ko": {
                            "label": "Korean"
                          },
                          "lo": {
                            "label": "Lao"
                          },
                          "la": {
                            "label": "Latin"
                          },
                          "lv": {
                            "label": "Latvian"
                          },
                          "ln": {
                            "label": "Lingala"
                          },
                          "lt": {
                            "label": "Lithuanian"
                          },
                          "lb": {
                            "label": "Luxembourgish"
                          },
                          "mk": {
                            "label": "Macedonian"
                          },
                          "mg": {
                            "label": "Malagasy"
                          },
                          "ms": {
                            "label": "Malay"
                          },
                          "ml": {
                            "label": "Malayalam"
                          },
                          "mt": {
                            "label": "Maltese"
                          },
                          "mi": {
                            "label": "Maori"
                          },
                          "mr": {
                            "label": "Marathi"
                          },
                          "mn": {
                            "label": "Mongolian"
                          },
                          "ne": {
                            "label": "Nepali"
                          },
                          "no": {
                            "label": "Norwegian"
                          },
                          "nn": {
                            "label": "Norwegian Nynorsk"
                          },
                          "oc": {
                            "label": "Occitan"
                          },
                          "pa": {
                            "label": "Panjabi"
                          },
                          "ps": {
                            "label": "Pashto"
                          },
                          "fa": {
                            "label": "Persian"
                          },
                          "pl": {
                            "label": "Polish"
                          },
                          "ro": {
                            "label": "Romanian"
                          },
                          "ru": {
                            "label": "Russian"
                          },
                          "sa": {
                            "label": "Sanskrit"
                          },
                          "sr": {
                            "label": "Serbian"
                          },
                          "sn": {
                            "label": "Shona"
                          },
                          "sd": {
                            "label": "Sindhi"
                          },
                          "si": {
                            "label": "Sinhala"
                          },
                          "sk": {
                            "label": "Slovak"
                          },
                          "sl": {
                            "label": "Slovenian"
                          },
                          "so": {
                            "label": "Somali"
                          },
                          "su": {
                            "label": "Sundanese"
                          },
                          "sw": {
                            "label": "Swahili"
                          },
                          "sv": {
                            "label": "Swedish"
                          },
                          "tl": {
                            "label": "Tagalog"
                          },
                          "tg": {
                            "label": "Tajik"
                          },
                          "ta": {
                            "label": "Tamil"
                          },
                          "tt": {
                            "label": "Tatar"
                          },
                          "te": {
                            "label": "Telugu"
                          },
                          "th": {
                            "label": "Thai"
                          },
                          "bo": {
                            "label": "Tibetan"
                          },
                          "tr": {
                            "label": "Turkish"
                          },
                          "tk": {
                            "label": "Turkmen"
                          },
                          "uk": {
                            "label": "Ukrainian"
                          },
                          "ur": {
                            "label": "Urdu"
                          },
                          "uz": {
                            "label": "Uzbek"
                          },
                          "vi": {
                            "label": "Vietnamese"
                          },
                          "cy": {
                            "label": "Welsh"
                          },
                          "yi": {
                            "label": "Yiddish"
                          },
                          "yo": {
                            "label": "Yoruba"
                          }
                        }
                      },
                      {
                        "type": "string"
                      }
                    ]
                  },
                  {
                    "type": "string",
                    "nullable": true
                  }
                ],
                "default": "en_us",
                "x-ts-type": "LiteralUnion<TranscriptLanguageCode, string> | null",
                "x-go-type": "TranscriptLanguageCode"
              },
              "language_detection": {
                "x-label": "Language detection",
                "description": "Enable [Automatic language detection](https://www.assemblyai.com/docs/models/speech-recognition#automatic-language-detection), either true or false.",
                "type": "boolean",
                "default": false
              },
              "language_confidence_threshold": {
                "x-label": "Language confidence threshold",
                "description": "The confidence threshold for the automatically detected language.\nAn error will be returned if the language confidence is below this threshold.\nDefaults to 0.\n",
                "type": "number",
                "format": "float",
                "minimum": 0,
                "maximum": 1,
                "default": 0
              },
              "speech_model": {
                "x-label": "Speech model",
                "description": "The speech model to use for the transcription. When `null`, the \"best\" model is used.",
                "default": "best",
                "oneOf": [
                  {
                    "x-label": "Speech model",
                    "type": "string",
                    "description": "The speech model to use for the transcription.",
                    "x-fern-sdk-group-name": "transcripts",
                    "enum": [
                      "best",
                      "slam-1",
                      "universal"
                    ],
                    "x-fern-enum": {
                      "universal": {
                        "name": "Universal",
                        "description": "The model optimized for accuracy, low latency, ease of use, and mutli-language support."
                      },
                      "slam-1": {
                        "name": "Slam-1",
                        "description": "A contextual model optimized for customization."
                      },
                      "best": {
                        "name": "Best",
                        "description": "The model optimized for accuracy, low latency, ease of use, and mutli-language support."
                      }
                    },
                    "x-aai-enum": {
                      "best": {
                        "label": "Best"
                      },
                      "nano": {
                        "label": "Nano"
                      }
                    }
                  },
                  {
                    "type": "string",
                    "nullable": true
                  }
                ]
              },
              "punctuate": {
                "x-label": "Punctuate",
                "description": "Enable Automatic Punctuation, can be true or false",
                "type": "boolean",
                "default": true
              },
              "format_text": {
                "x-label": "Format text",
                "description": "Enable Text Formatting, can be true or false",
                "type": "boolean",
                "default": true
              },
              "disfluencies": {
                "x-label": "Disfluencies",
                "description": "Transcribe Filler Words, like \"umm\", in your media file; can be true or false",
                "type": "boolean",
                "default": false
              },
              "multichannel": {
                "x-label": "Multichannel",
                "description": "Enable [Multichannel](https://www.assemblyai.com/docs/models/speech-recognition#multichannel-transcription) transcription, can be true or false.",
                "type": "boolean",
                "default": false
              },
              "dual_channel": {
                "x-label": "Dual channel",
                "description": "Enable [Dual Channel](https://www.assemblyai.com/docs/models/speech-recognition#dual-channel-transcription) transcription, can be true or false.",
                "type": "boolean",
                "default": false,
                "deprecated": true
              },
              "webhook_url": {
                "x-label": "Webhook URL",
                "description": "The URL to which we send webhook requests.\nWe sends two different types of webhook requests.\nOne request when a transcript is completed or failed, and one request when the redacted audio is ready if redact_pii_audio is enabled.\n",
                "type": "string",
                "format": "url"
              },
              "webhook_auth_header_name": {
                "x-label": "Webhook auth header name",
                "description": "The header name to be sent with the transcript completed or failed webhook requests",
                "type": "string",
                "default": null,
                "nullable": true
              },
              "webhook_auth_header_value": {
                "x-label": "Webhook auth header value",
                "description": "The header value to send back with the transcript completed or failed webhook requests for added security",
                "type": "string",
                "default": null,
                "nullable": true
              },
              "auto_highlights": {
                "x-label": "Key phrases",
                "description": "Enable Key Phrases, either true or false",
                "type": "boolean",
                "default": false
              },
              "audio_start_from": {
                "x-label": "Audio start from",
                "description": "The point in time, in milliseconds, to begin transcribing in your media file",
                "type": "integer"
              },
              "audio_end_at": {
                "x-label": "Audio end at",
                "description": "The point in time, in milliseconds, to stop transcribing in your media file",
                "type": "integer"
              },
              "word_boost": {
                "x-label": "Word boost",
                "description": "The list of custom vocabulary to boost transcription probability for",
                "type": "array",
                "items": {
                  "x-label": "Word to boost",
                  "type": "string"
                },
                "deprecated": true
              },
              "boost_param": {
                "type": "string",
                "x-label": "Word boost level",
                "description": "How much to boost specified words",
                "x-fern-sdk-group-name": "transcripts",
                "enum": [
                  "low",
                  "default",
                  "high"
                ],
                "x-aai-enum": {
                  "low": {
                    "label": "Low"
                  },
                  "default": {
                    "label": "Default"
                  },
                  "high": {
                    "label": "High"
                  }
                }
              },
              "filter_profanity": {
                "x-label": "Filter profanity",
                "description": "Filter profanity from the transcribed text, can be true or false",
                "type": "boolean",
                "default": false
              },
              "redact_pii": {
                "x-label": "Redact PII",
                "description": "Redact PII from the transcribed text using the Redact PII model, can be true or false",
                "type": "boolean",
                "default": false
              },
              "redact_pii_audio": {
                "x-label": "Redact PII audio",
                "description": "Generate a copy of the original media file with spoken PII \"beeped\" out, can be true or false. See [PII redaction](https://www.assemblyai.com/docs/models/pii-redaction) for more details.",
                "type": "boolean",
                "default": false
              },
              "redact_pii_audio_quality": {
                "x-label": "Redact PII audio quality",
                "type": "string",
                "description": "Controls the filetype of the audio created by redact_pii_audio. Currently supports mp3 (default) and wav. See [PII redaction](https://www.assemblyai.com/docs/models/pii-redaction) for more details.",
                "x-fern-sdk-group-name": "transcripts",
                "enum": [
                  "mp3",
                  "wav"
                ],
                "x-fern-enum": {
                  "mp3": {
                    "description": "MP3 audio format is lower quality and lower size than WAV.",
                    "casing": {
                      "camel": "mp3",
                      "snake": "mp3",
                      "pascal": "Mp3",
                      "screamingSnake": "MP3"
                    }
                  },
                  "wav": {
                    "description": "WAV audio format is the highest quality (no compression) and larger size than MP3."
                  }
                },
                "x-aai-enum": {
                  "mp3": {
                    "label": "MP3"
                  },
                  "wav": {
                    "label": "WAV"
                  }
                },
                "example": "mp3"
              },
              "redact_pii_policies": {
                "x-label": "Redact PII policies",
                "description": "The list of PII Redaction policies to enable. See [PII redaction](https://www.assemblyai.com/docs/models/pii-redaction) for more details.",
                "type": "array",
                "items": {
                  "x-label": "PII policy",
                  "description": "The type of PII to redact",
                  "x-fern-sdk-group-name": "transcripts",
                  "type": "string",
                  "enum": [
                    "account_number",
                    "banking_information",
                    "blood_type",
                    "credit_card_cvv",
                    "credit_card_expiration",
                    "credit_card_number",
                    "date",
                    "date_interval",
                    "date_of_birth",
                    "drivers_license",
                    "drug",
                    "duration",
                    "email_address",
                    "event",
                    "filename",
                    "gender_sexuality",
                    "healthcare_number",
                    "injury",
                    "ip_address",
                    "language",
                    "location",
                    "marital_status",
                    "medical_condition",
                    "medical_process",
                    "money_amount",
                    "nationality",
                    "number_sequence",
                    "occupation",
                    "organization",
                    "passport_number",
                    "password",
                    "person_age",
                    "person_name",
                    "phone_number",
                    "physical_attribute",
                    "political_affiliation",
                    "religion",
                    "statistics",
                    "time",
                    "url",
                    "us_social_security_number",
                    "username",
                    "vehicle_id",
                    "zodiac_sign"
                  ],
                  "x-fern-enum": {
                    "account_number": {
                      "description": "Customer account or membership identification number (e.g., Policy No. 10042992, Member ID: HZ-5235-001)"
                    },
                    "banking_information": {
                      "description": "Banking information, including account and routing numbers"
                    },
                    "blood_type": {
                      "description": "Blood type (e.g., O-, AB positive)"
                    },
                    "credit_card_cvv": {
                      "description": "Credit card verification code (e.g., CVV: 080)"
                    },
                    "credit_card_expiration": {
                      "description": "Expiration date of a credit card"
                    },
                    "credit_card_number": {
                      "description": "Credit card number"
                    },
                    "date": {
                      "description": "Specific calendar date (e.g., December 18)"
                    },
                    "date_interval": {
                      "description": "Broader time periods, including date ranges, months, seasons, years, and decades (e.g., 2020-2021, 5-9 May, January 1984)"
                    },
                    "date_of_birth": {
                      "description": "Date of birth (e.g., Date of Birth: March 7,1961)"
                    },
                    "drivers_license": {
                      "description": "Driver's license number. (e.g., DL# 356933-540)"
                    },
                    "drug": {
                      "description": "Medications, vitamins, or supplements (e.g., Advil, Acetaminophen, Panadol)"
                    },
                    "duration": {
                      "description": "Periods of time, specified as a number and a unit of time (e.g., 8 months, 2 years)"
                    },
                    "email_address": {
                      "description": "Email address (e.g., support@assemblyai.com)"
                    },
                    "event": {
                      "description": "Name of an event or holiday (e.g., Olympics, Yom Kippur)"
                    },
                    "filename": {
                      "description": "Names of computer files, including the extension or filepath (e.g., Taxes/2012/brad-tax-returns.pdf)"
                    },
                    "gender_sexuality": {
                      "description": "Terms indicating gender identity or sexual orientation, including slang terms (e.g., female, bisexual, trans)"
                    },
                    "healthcare_number": {
                      "description": "Healthcare numbers and health plan beneficiary numbers (e.g., Policy No.: 5584-486-674-YM)"
                    },
                    "injury": {
                      "description": "Bodily injury (e.g., I broke my arm, I have a sprained wrist)"
                    },
                    "ip_address": {
                      "description": "Internet IP address, including IPv4 and IPv6 formats (e.g., 192.168.0.1)"
                    },
                    "language": {
                      "description": "Name of a natural language (e.g., Spanish, French)"
                    },
                    "location": {
                      "description": "Any Location reference including mailing address, postal code, city, state, province, country, or coordinates. (e.g., Lake Victoria, 145 Windsor St., 90210)"
                    },
                    "marital_status": {
                      "description": "Terms indicating marital status (e.g., Single, common-law, ex-wife, married)"
                    },
                    "medical_condition": {
                      "description": "Name of a medical condition, disease, syndrome, deficit, or disorder (e.g., chronic fatigue syndrome, arrhythmia, depression)"
                    },
                    "medical_process": {
                      "description": "Medical process, including treatments, procedures, and tests (e.g., heart surgery, CT scan)"
                    },
                    "money_amount": {
                      "description": "Name and/or amount of currency (e.g., 15 pesos, $94.50)"
                    },
                    "nationality": {
                      "description": "Terms indicating nationality, ethnicity, or race (e.g., American, Asian, Caucasian)"
                    },
                    "number_sequence": {
                      "description": "Numerical PII (including alphanumeric strings) that doesn't fall under other categories"
                    },
                    "occupation": {
                      "description": "Job title or profession (e.g., professor, actors, engineer, CPA)"
                    },
                    "organization": {
                      "description": "Name of an organization (e.g., CNN, McDonalds, University of Alaska, Northwest General Hospital)"
                    },
                    "passport_number": {
                      "description": "Passport numbers, issued by any country (e.g., PA4568332, NU3C6L86S12)"
                    },
                    "password": {
                      "description": "Account passwords, PINs, access keys, or verification answers (e.g., 27%alfalfa, temp1234, My mother's maiden name is Smith)"
                    },
                    "person_age": {
                      "description": "Number associated with an age (e.g., 27, 75)"
                    },
                    "person_name": {
                      "description": "Name of a person (e.g., Bob, Doug Jones, Dr. Kay Martinez, MD)"
                    },
                    "phone_number": {
                      "description": "Telephone or fax number"
                    },
                    "physical_attribute": {
                      "description": "Distinctive bodily attributes, including terms indicating race (e.g., I'm 190cm tall, He belongs to the Black students' association)"
                    },
                    "political_affiliation": {
                      "description": "Terms referring to a political party, movement, or ideology (e.g., Republican, Liberal)"
                    },
                    "religion": {
                      "description": "Terms indicating religious affiliation (e.g., Hindu, Catholic)"
                    },
                    "statistics": {
                      "description": "Medical statistics (e.g., 18%, 18 percent)"
                    },
                    "time": {
                      "description": "Expressions indicating clock times (e.g., 19:37:28, 10pm EST)"
                    },
                    "url": {
                      "description": "Internet addresses (e.g., https://www.assemblyai.com/)"
                    },
                    "us_social_security_number": {
                      "description": "Social Security Number or equivalent"
                    },
                    "username": {
                      "description": "Usernames, login names, or handles (e.g., @AssemblyAI)"
                    },
                    "vehicle_id": {
                      "description": "Vehicle identification numbers (VINs), vehicle serial numbers, and license plate numbers (e.g., 5FNRL38918B111818, BIF7547)"
                    },
                    "zodiac_sign": {
                      "description": "Names of Zodiac signs (e.g., Aries, Taurus)"
                    }
                  },
                  "x-aai-enum": {
                    "account_number": {
                      "label": "Account number"
                    },
                    "banking_information": {
                      "label": "Banking information"
                    },
                    "blood_type": {
                      "label": "Blood type"
                    },
                    "credit_card_cvv": {
                      "label": "Credit card CVV"
                    },
                    "credit_card_expiration": {
                      "label": "Credit card expiration"
                    },
                    "credit_card_number": {
                      "label": "Credit card number"
                    },
                    "date": {
                      "label": "Date"
                    },
                    "date_interval": {
                      "label": "Date interval"
                    },
                    "date_of_birth": {
                      "label": "Date of birth"
                    },
                    "drivers_license": {
                      "label": "Driver's license"
                    },
                    "drug": {
                      "label": "Drug"
                    },
                    "duration": {
                      "label": "Duration"
                    },
                    "email_address": {
                      "label": "Email address"
                    },
                    "event": {
                      "label": "Event"
                    },
                    "filename": {
                      "label": "Filename"
                    },
                    "gender_sexuality": {
                      "label": "Gender sexuality"
                    },
                    "healthcare_number": {
                      "label": "Healthcare number"
                    },
                    "injury": {
                      "label": "Injury"
                    },
                    "ip_address": {
                      "label": "IP address"
                    },
                    "language": {
                      "label": "Language"
                    },
                    "location": {
                      "label": "Location"
                    },
                    "marital_status": {
                      "label": "Marital status"
                    },
                    "medical_condition": {
                      "label": "Medical condition"
                    },
                    "medical_process": {
                      "label": "Medical process"
                    },
                    "money_amount": {
                      "label": "Money amount"
                    },
                    "nationality": {
                      "label": "Nationality"
                    },
                    "number_sequence": {
                      "label": "Number sequence"
                    },
                    "occupation": {
                      "label": "Occupation"
                    },
                    "organization": {
                      "label": "Organization"
                    },
                    "passport_number": {
                      "label": "Passport number"
                    },
                    "password": {
                      "label": "Password"
                    },
                    "person_age": {
                      "label": "Person age"
                    },
                    "person_name": {
                      "label": "Person name"
                    },
                    "phone_number": {
                      "label": "Phone number"
                    },
                    "physical_attribute": {
                      "label": "Physical attribute"
                    },
                    "political_affiliation": {
                      "label": "Political affiliation"
                    },
                    "religion": {
                      "label": "Religion"
                    },
                    "statistics": {
                      "label": "Statistics"
                    },
                    "time": {
                      "label": "Time"
                    },
                    "url": {
                      "label": "URL"
                    },
                    "us_social_security_number": {
                      "label": "US Social Security Number"
                    },
                    "username": {
                      "label": "Username"
                    },
                    "vehicle_id": {
                      "label": "Vehicle ID"
                    },
                    "zodiac_sign": {
                      "label": "Zodiac sign"
                    }
                  }
                }
              },
              "redact_pii_sub": {
                "x-label": "Redact PII substitution",
                "description": "The replacement logic for detected PII, can be \"entity_type\" or \"hash\". See [PII redaction](https://www.assemblyai.com/docs/models/pii-redaction) for more details.",
                "oneOf": [
                  {
                    "x-label": "Redact PII substitution",
                    "type": "string",
                    "x-fern-sdk-group-name": "transcripts",
                    "description": "The replacement logic for detected PII, can be \"entity_name\" or \"hash\". See [PII redaction](https://www.assemblyai.com/docs/models/pii-redaction) for more details.",
                    "enum": [
                      "entity_name",
                      "hash"
                    ],
                    "x-aai-enum": {
                      "entity_name": {
                        "label": "Entity name"
                      },
                      "hash": {
                        "label": "Hash"
                      }
                    }
                  },
                  {
                    "type": "string",
                    "nullable": true
                  }
                ],
                "default": "hash"
              },
              "speaker_labels": {
                "x-label": "Speaker labels",
                "description": "Enable [Speaker diarization](https://www.assemblyai.com/docs/models/speaker-diarization), can be true or false",
                "type": "boolean",
                "default": false
              },
              "speakers_expected": {
                "x-label": "Speakers expected",
                "description": "Tells the speaker label model how many speakers it should attempt to identify. See [Speaker diarization](https://www.assemblyai.com/docs/models/speaker-diarization) for more details.",
                "type": "integer",
                "default": null,
                "nullable": true
              },
              "content_safety": {
                "x-label": "Content Moderation",
                "description": "Enable [Content Moderation](https://www.assemblyai.com/docs/models/content-moderation), can be true or false",
                "type": "boolean",
                "default": false
              },
              "content_safety_confidence": {
                "x-label": "Content Moderation confidence",
                "description": "The confidence threshold for the Content Moderation model. Values must be between 25 and 100.",
                "type": "integer",
                "default": 50,
                "minimum": 25,
                "maximum": 100
              },
              "iab_categories": {
                "x-label": "Topic Detection",
                "description": "Enable [Topic Detection](https://www.assemblyai.com/docs/models/topic-detection), can be true or false",
                "type": "boolean",
                "default": false
              },
              "custom_spelling": {
                "x-label": "Custom spellings",
                "description": "Customize how words are spelled and formatted using to and from values",
                "type": "array",
                "items": {
                  "x-label": "Custom spelling",
                  "description": "Object containing words or phrases to replace, and the word or phrase to replace with",
                  "x-fern-sdk-group-name": "transcripts",
                  "type": "object",
                  "additionalProperties": false,
                  "properties": {
                    "from": {
                      "x-label": "From",
                      "description": "Words or phrases to replace",
                      "type": "array",
                      "items": {
                        "x-label": "Word or phrase",
                        "description": "Word or phrase to replace",
                        "type": "string"
                      }
                    },
                    "to": {
                      "x-label": "To",
                      "description": "Word to replace with",
                      "type": "string"
                    }
                  },
                  "required": [
                    "from",
                    "to"
                  ],
                  "example": {
                    "from": [
                      "dicarlo"
                    ],
                    "to": "Decarlo"
                  }
                }
              },
              "keyterms_prompt": {
                "x-label": "Keyterms prompt",
                "description": "<Warning>`keyterms_prompt` is only supported when the `speech_model` is specified as `slam-1`</Warning>\nImprove accuracy with up to 1000 domain-specific words or phrases (maximum 6 words per phrase).\n",
                "type": "array",
                "items": {
                  "x-label": "Keyterm",
                  "type": "string"
                }
              },
              "prompt": {
                "x-label": "Prompt",
                "description": "This parameter does not currently have any functionality attached to it.",
                "type": "string",
                "deprecated": true
              },
              "sentiment_analysis": {
                "x-label": "Sentiment Analysis",
                "description": "Enable [Sentiment Analysis](https://www.assemblyai.com/docs/models/sentiment-analysis), can be true or false",
                "type": "boolean",
                "default": false
              },
              "auto_chapters": {
                "x-label": "Auto chapters",
                "description": "Enable [Auto Chapters](https://www.assemblyai.com/docs/models/auto-chapters), can be true or false",
                "type": "boolean",
                "default": false
              },
              "entity_detection": {
                "x-label": "Entity Detection",
                "description": "Enable [Entity Detection](https://www.assemblyai.com/docs/models/entity-detection), can be true or false",
                "type": "boolean",
                "default": false
              },
              "speech_threshold": {
                "x-label": "Speech threshold",
                "description": "Reject audio files that contain less than this fraction of speech.\nValid values are in the range [0, 1] inclusive.\n",
                "type": "number",
                "format": "float",
                "minimum": 0,
                "maximum": 1,
                "default": 0,
                "nullable": true
              },
              "summarization": {
                "x-label": "Enable Summarization",
                "description": "Enable [Summarization](https://www.assemblyai.com/docs/models/summarization), can be true or false",
                "type": "boolean",
                "default": false
              },
              "summary_model": {
                "type": "string",
                "x-label": "Summary model",
                "description": "The model to summarize the transcript",
                "x-fern-sdk-group-name": "transcripts",
                "enum": [
                  "informative",
                  "conversational",
                  "catchy"
                ],
                "x-aai-enum": {
                  "informative": {
                    "label": "Informative"
                  },
                  "conversational": {
                    "label": "Conversational"
                  },
                  "catchy": {
                    "label": "Catchy"
                  }
                }
              },
              "summary_type": {
                "type": "string",
                "x-label": "Summary type",
                "description": "The type of summary",
                "x-fern-sdk-group-name": "transcripts",
                "enum": [
                  "bullets",
                  "bullets_verbose",
                  "gist",
                  "headline",
                  "paragraph"
                ],
                "x-aai-enum": {
                  "bullets": {
                    "label": "Bullets"
                  },
                  "bullets_verbose": {
                    "label": "Bullets verbose"
                  },
                  "gist": {
                    "label": "Gist"
                  },
                  "headline": {
                    "label": "Headline"
                  },
                  "paragraph": {
                    "label": "Paragraph"
                  }
                }
              },
              "custom_topics": {
                "x-label": "Enable custom topics",
                "description": "Enable custom topics, either true or false",
                "type": "boolean",
                "default": false,
                "deprecated": true
              },
              "topics": {
                "x-label": "Custom topics",
                "description": "The list of custom topics",
                "type": "array",
                "items": {
                  "x-label": "Topic",
                  "type": "string"
                }
              }
            },
            "type": "object",
            "additionalProperties": false,
            "x-label": "Optional transcript parameters",
            "description": "The parameters for creating a transcript",
            "x-fern-sdk-group-name": "transcripts",
            "example": {
              "speech_model": null,
              "language_code": "en_us",
              "language_detection": true,
              "language_confidence_threshold": 0.7,
              "punctuate": true,
              "format_text": true,
              "multichannel": true,
              "dual_channel": false,
              "webhook_url": "https://your-webhook-url.tld/path",
              "webhook_auth_header_name": "webhook-secret",
              "webhook_auth_header_value": "webhook-secret-value",
              "auto_highlights": true,
              "audio_start_from": 10,
              "audio_end_at": 280,
              "word_boost": [
                "aws",
                "azure",
                "google cloud"
              ],
              "boost_param": "high",
              "filter_profanity": true,
              "redact_pii": true,
              "redact_pii_audio": true,
              "redact_pii_audio_quality": "mp3",
              "redact_pii_policies": [
                "us_social_security_number",
                "credit_card_number"
              ],
              "redact_pii_sub": "hash",
              "speaker_labels": true,
              "speakers_expected": 2,
              "content_safety": true,
              "iab_categories": true,
              "custom_spelling": [],
              "disfluencies": false,
              "sentiment_analysis": true,
              "auto_chapters": true,
              "entity_detection": true,
              "speech_threshold": 0.5,
              "summarization": true,
              "summary_model": "informative",
              "summary_type": "bullets",
              "custom_topics": true,
              "topics": []
            },
            "readOnly": true,
            "nullable": true
          },
          "deepgram_async": {
            "type": "object",
            "properties": {
              "callback": {
                "type": "string"
              },
              "callback_method": {
                "default": "POST",
                "enum": [
                  "POST",
                  "PUT"
                ]
              },
              "custom_topic": {
                "oneOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "maxItems": 100
                  }
                ]
              },
              "custom_topic_mode": {
                "default": "extended",
                "type": "string",
                "enum": [
                  "extended",
                  "strict"
                ]
              },
              "custom_intent": {
                "oneOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "array",
                    "items": {
                      "type": "string",
                      "maxItems": 100
                    }
                  }
                ]
              },
              "custom_intent_mode": {
                "default": "extended",
                "type": "string",
                "enum": [
                  "extended",
                  "strict"
                ]
              },
              "detect_entities": {
                "default": false,
                "type": "boolean"
              },
              "detect_language": {
                "oneOf": [
                  {
                    "type": "boolean",
                    "default": false
                  },
                  {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                ]
              },
              "diarize": {
                "default": false,
                "type": "boolean"
              },
              "dictation": {
                "default": false,
                "type": "boolean"
              },
              "encoding": {
                "type": "string",
                "enum": [
                  "linear16",
                  "flac",
                  "mulaw",
                  "amr-nb",
                  "amr-wb",
                  "opus",
                  "speex",
                  "g729"
                ]
              },
              "extra": {
                "oneOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                ]
              },
              "filler_words": {
                "default": false,
                "type": "boolean"
              },
              "intents": {
                "default": false,
                "type": "boolean"
              },
              "keyterm": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "keywords": {
                "oneOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                ]
              },
              "language": {
                "type": "string",
                "default": "en",
                "enum": [
                  "bg",
                  "ca",
                  "zh",
                  "zh-CN",
                  "zh-TW",
                  "zh-HK",
                  "zh-Hans",
                  "zh-Hant",
                  "cs",
                  "da",
                  "da-DK",
                  "nl",
                  "nl-BE",
                  "en",
                  "en-US",
                  "en-AU",
                  "en-GB",
                  "en-NZ",
                  "en-IN",
                  "et",
                  "fi",
                  "fr",
                  "fr-CA",
                  "de",
                  "de-CH",
                  "el",
                  "hi",
                  "hi-Latn",
                  "hu",
                  "id",
                  "it",
                  "ja",
                  "ko",
                  "ko-KR",
                  "lv",
                  "lt",
                  "ms",
                  "multi",
                  "no",
                  "pl",
                  "pt",
                  "pt-BR",
                  "pt-PT",
                  "ro",
                  "ru",
                  "sk",
                  "es",
                  "es-419",
                  "es-LATAM",
                  "sv",
                  "sv-SE",
                  "taq",
                  "th",
                  "th-TH",
                  "tr",
                  "uk",
                  "vi"
                ]
              },
              "measurements": {
                "default": false,
                "type": "boolean"
              },
              "mip_opt_out": {
                "default": false,
                "type": "boolean"
              },
              "model": {
                "default": "base-general",
                "anyOf": [
                  {
                    "type": "string",
                    "description": "Our public models available to all accounts",
                    "enum": [
                      "nova-3",
                      "nova-3-general",
                      "nova-3-medical",
                      "nova-2",
                      "nova-2-general",
                      "nova-2-meeting",
                      "nova-2-finance",
                      "nova-2-conversationalai",
                      "nova-2-voicemail",
                      "nova-2-video",
                      "nova-2-medical",
                      "nova-2-drivethru",
                      "nova-2-automotive",
                      "nova",
                      "nova-general",
                      "nova-phonecall",
                      "nova-medical",
                      "enhanced",
                      "enhanced-general",
                      "enhanced-meeting",
                      "enhanced-phonecall",
                      "enhanced-finance",
                      "base",
                      "meeting",
                      "phonecall",
                      "finance",
                      "conversationalai",
                      "voicemail",
                      "video"
                    ]
                  },
                  {
                    "type": "string",
                    "description": "Custom string if you've had a model trained by Deepgram"
                  }
                ],
                "example": "nova-3"
              },
              "multichannel": {
                "default": false,
                "type": "boolean"
              },
              "numerals": {
                "default": false,
                "type": "boolean"
              },
              "paragraphs": {
                "default": false,
                "type": "boolean"
              },
              "profanity_filter": {
                "default": false,
                "type": "boolean"
              },
              "punctuate": {
                "default": false,
                "type": "boolean"
              },
              "redact": {
                "default": false,
                "oneOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "array",
                    "items": {
                      "type": "string",
                      "enum": [
                        "pci",
                        "pii",
                        "numbers"
                      ]
                    },
                    "maxItems": 100
                  }
                ]
              },
              "replace": {
                "oneOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                ]
              },
              "search": {
                "oneOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                ]
              },
              "sentiment": {
                "default": false,
                "type": "boolean"
              },
              "smart_format": {
                "default": false,
                "type": "boolean"
              },
              "summarize": {
                "type": "string",
                "enum": [
                  "v1",
                  "v2",
                  "true",
                  "false"
                ]
              },
              "tag": {
                "oneOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                ]
              },
              "topics": {
                "default": false,
                "type": "boolean"
              },
              "utterances": {
                "default": false,
                "type": "boolean"
              },
              "utt_split": {
                "default": 0.8,
                "type": "number"
              },
              "version": {
                "default": "latest",
                "oneOf": [
                  {
                    "type": "string",
                    "description": "Use the latest version of a model",
                    "enum": [
                      "latest"
                    ]
                  },
                  {
                    "type": "string",
                    "description": "Use a previous version of a model"
                  }
                ]
              }
            },
            "readOnly": true,
            "nullable": true
          },
          "gladia_v2_async": {
            "type": "object",
            "properties": {
              "context_prompt": {
                "type": "string",
                "description": "**[Deprecated]** Context to feed the transcription model with for possible better accuracy",
                "deprecated": true
              },
              "custom_vocabulary": {
                "type": "boolean",
                "description": "**[Beta]** Can be either boolean to enable custom_vocabulary for this audio or an array with specific vocabulary list to feed the transcription model with",
                "default": false
              },
              "custom_vocabulary_config": {
                "properties": {
                  "vocabulary": {
                    "description": "Specific vocabulary list to feed the transcription model with. Each item can be a string or an object with the following properties: value, intensity, pronunciations, language.",
                    "example": [
                      "Westeros",
                      {
                        "value": "Stark"
                      },
                      {
                        "value": "Night's Watch",
                        "pronunciations": [
                          "Nightz Watch"
                        ],
                        "intensity": 0.4,
                        "language": "en"
                      }
                    ],
                    "type": "array",
                    "items": {
                      "oneOf": [
                        {
                          "type": "object",
                          "properties": {
                            "value": {
                              "type": "string",
                              "description": "The text used to replace in the transcription.",
                              "example": "Gladia"
                            },
                            "intensity": {
                              "type": "number",
                              "description": "The global intensity of the feature.",
                              "example": 0.5,
                              "minimum": 0,
                              "maximum": 1
                            },
                            "pronunciations": {
                              "description": "The pronunciations used in the transcription.",
                              "type": "array",
                              "items": {
                                "type": "string"
                              }
                            },
                            "language": {
                              "type": "string",
                              "description": "Specify the language in which it will be pronounced when sound comparison occurs. Default to transcription language.",
                              "example": "en"
                            }
                          },
                          "required": [
                            "value"
                          ]
                        },
                        {
                          "type": "string"
                        }
                      ]
                    }
                  },
                  "default_intensity": {
                    "type": "number",
                    "description": "Default intensity for the custom vocabulary",
                    "example": 0.5,
                    "minimum": 0,
                    "maximum": 1
                  }
                },
                "required": [
                  "vocabulary"
                ],
                "type": "object",
                "description": "**[Beta]** Custom vocabulary configuration, if `custom_vocabulary` is enabled"
              },
              "detect_language": {
                "type": "boolean",
                "description": "**[Deprecated]** Use `language_config` instead. Detect the language from the given audio",
                "default": true,
                "deprecated": true
              },
              "enable_code_switching": {
                "type": "boolean",
                "description": "**[Deprecated]** Use `language_config` instead.Detect multiple languages in the given audio",
                "default": false,
                "deprecated": true
              },
              "code_switching_config": {
                "properties": {
                  "languages": {
                    "type": "array",
                    "description": "Specify the languages you want to use when detecting multiple languages",
                    "default": [],
                    "items": {
                      "type": "string",
                      "enum": [
                        "af",
                        "sq",
                        "am",
                        "ar",
                        "hy",
                        "as",
                        "az",
                        "ba",
                        "eu",
                        "be",
                        "bn",
                        "bs",
                        "br",
                        "bg",
                        "ca",
                        "zh",
                        "hr",
                        "cs",
                        "da",
                        "nl",
                        "en",
                        "et",
                        "fo",
                        "fi",
                        "fr",
                        "gl",
                        "ka",
                        "de",
                        "el",
                        "gu",
                        "ht",
                        "ha",
                        "haw",
                        "he",
                        "hi",
                        "hu",
                        "is",
                        "id",
                        "it",
                        "ja",
                        "jv",
                        "kn",
                        "kk",
                        "km",
                        "ko",
                        "lo",
                        "la",
                        "lv",
                        "ln",
                        "lt",
                        "lb",
                        "mk",
                        "mg",
                        "ms",
                        "ml",
                        "mt",
                        "mi",
                        "mr",
                        "mn",
                        "mymr",
                        "ne",
                        "no",
                        "nn",
                        "oc",
                        "ps",
                        "fa",
                        "pl",
                        "pt",
                        "pa",
                        "ro",
                        "ru",
                        "sa",
                        "sr",
                        "sn",
                        "sd",
                        "si",
                        "sk",
                        "sl",
                        "so",
                        "es",
                        "su",
                        "sw",
                        "sv",
                        "tl",
                        "tg",
                        "ta",
                        "tt",
                        "te",
                        "th",
                        "bo",
                        "tr",
                        "tk",
                        "uk",
                        "ur",
                        "uz",
                        "vi",
                        "cy",
                        "yi",
                        "yo",
                        "jp"
                      ]
                    }
                  }
                },
                "type": "object",
                "description": "**[Deprecated]** Use `language_config` instead. Specify the configuration for code switching",
                "deprecated": true
              },
              "language": {
                "type": "string",
                "description": "**[Deprecated]** Use `language_config` instead. Set the spoken language for the given audio (ISO 639 standard)",
                "deprecated": true,
                "enum": [
                  "af",
                  "sq",
                  "am",
                  "ar",
                  "hy",
                  "as",
                  "az",
                  "ba",
                  "eu",
                  "be",
                  "bn",
                  "bs",
                  "br",
                  "bg",
                  "ca",
                  "zh",
                  "hr",
                  "cs",
                  "da",
                  "nl",
                  "en",
                  "et",
                  "fo",
                  "fi",
                  "fr",
                  "gl",
                  "ka",
                  "de",
                  "el",
                  "gu",
                  "ht",
                  "ha",
                  "haw",
                  "he",
                  "hi",
                  "hu",
                  "is",
                  "id",
                  "it",
                  "ja",
                  "jv",
                  "kn",
                  "kk",
                  "km",
                  "ko",
                  "lo",
                  "la",
                  "lv",
                  "ln",
                  "lt",
                  "lb",
                  "mk",
                  "mg",
                  "ms",
                  "ml",
                  "mt",
                  "mi",
                  "mr",
                  "mn",
                  "mymr",
                  "ne",
                  "no",
                  "nn",
                  "oc",
                  "ps",
                  "fa",
                  "pl",
                  "pt",
                  "pa",
                  "ro",
                  "ru",
                  "sa",
                  "sr",
                  "sn",
                  "sd",
                  "si",
                  "sk",
                  "sl",
                  "so",
                  "es",
                  "su",
                  "sw",
                  "sv",
                  "tl",
                  "tg",
                  "ta",
                  "tt",
                  "te",
                  "th",
                  "bo",
                  "tr",
                  "tk",
                  "uk",
                  "ur",
                  "uz",
                  "vi",
                  "cy",
                  "yi",
                  "yo",
                  "jp"
                ]
              },
              "callback_url": {
                "type": "string",
                "description": "**[Deprecated]** Use `callback`/`callback_config` instead. Callback URL we will do a `POST` request to with the result of the transcription",
                "example": "http://callback.example",
                "format": "uri",
                "deprecated": true
              },
              "callback": {
                "type": "boolean",
                "description": "Enable callback for this transcription. If true, the `callback_config` property will be used to customize the callback behaviour",
                "default": false
              },
              "callback_config": {
                "properties": {
                  "url": {
                    "type": "string",
                    "description": "The URL to be called with the result of the transcription",
                    "example": "http://callback.example",
                    "format": "uri"
                  },
                  "method": {
                    "type": "string",
                    "description": "The HTTP method to be used. Allowed values are `POST` or `PUT` (default: `POST`)",
                    "default": "POST",
                    "enum": [
                      "POST",
                      "PUT"
                    ]
                  }
                },
                "required": [
                  "url"
                ],
                "type": "object",
                "description": "Customize the callback behaviour (url and http method)"
              },
              "subtitles": {
                "type": "boolean",
                "description": "Enable subtitles generation for this transcription",
                "default": false
              },
              "subtitles_config": {
                "properties": {
                  "formats": {
                    "type": "array",
                    "minItems": 1,
                    "example": [
                      "srt"
                    ],
                    "items": {
                      "type": "string",
                      "description": "Subtitles formats you want your transcription to be formatted to",
                      "enum": [
                        "srt",
                        "vtt"
                      ]
                    }
                  },
                  "minimum_duration": {
                    "type": "number",
                    "description": "Minimum duration of a subtitle in seconds",
                    "minimum": 0
                  },
                  "maximum_duration": {
                    "type": "number",
                    "description": "Maximum duration of a subtitle in seconds",
                    "minimum": 1,
                    "maximum": 30
                  },
                  "maximum_characters_per_row": {
                    "type": "integer",
                    "description": "Maximum number of characters per row in a subtitle",
                    "minimum": 1
                  },
                  "maximum_rows_per_caption": {
                    "type": "integer",
                    "description": "Maximum number of rows per caption",
                    "minimum": 1,
                    "maximum": 5
                  },
                  "style": {
                    "type": "string",
                    "description": "Style of the subtitles. Compliance mode refers to : https://loc.gov/preservation/digital/formats//fdd/fdd000569.shtml#:~:text=SRT%20files%20are%20basic%20text,alongside%2C%20example%3A%20%22MyVideo123 ",
                    "default": "default",
                    "enum": [
                      "default",
                      "compliance"
                    ]
                  }
                },
                "type": "object",
                "description": "Configuration for subtitles generation if `subtitles` is enabled"
              },
              "diarization": {
                "type": "boolean",
                "description": "Enable speaker recognition (diarization) for this audio",
                "default": false
              },
              "diarization_config": {
                "properties": {
                  "number_of_speakers": {
                    "type": "integer",
                    "description": "Exact number of speakers in the audio",
                    "example": 3,
                    "minimum": 1
                  },
                  "min_speakers": {
                    "type": "integer",
                    "description": "Minimum number of speakers in the audio",
                    "example": 1,
                    "minimum": 0
                  },
                  "max_speakers": {
                    "type": "integer",
                    "description": "Maximum number of speakers in the audio",
                    "example": 2,
                    "minimum": 0
                  },
                  "enhanced": {
                    "type": "boolean",
                    "description": "**[Alpha]** Use enhanced diarization for this audio",
                    "default": false
                  }
                },
                "type": "object",
                "description": "Speaker recognition configuration, if `diarization` is enabled"
              },
              "translation": {
                "type": "boolean",
                "description": "**[Beta]** Enable translation for this audio",
                "default": false
              },
              "translation_config": {
                "properties": {
                  "target_languages": {
                    "type": "array",
                    "example": [
                      "en"
                    ],
                    "minItems": 1,
                    "items": {
                      "type": "string",
                      "description": "The target language in `iso639-1` format",
                      "enum": [
                        "af",
                        "sq",
                        "am",
                        "ar",
                        "hy",
                        "as",
                        "ast",
                        "az",
                        "ba",
                        "eu",
                        "be",
                        "bn",
                        "bs",
                        "br",
                        "bg",
                        "my",
                        "ca",
                        "ceb",
                        "zh",
                        "hr",
                        "cs",
                        "da",
                        "nl",
                        "en",
                        "et",
                        "fo",
                        "fi",
                        "nl",
                        "fr",
                        "fy",
                        "ff",
                        "gd",
                        "gl",
                        "lg",
                        "ka",
                        "de",
                        "el",
                        "gu",
                        "ht",
                        "ha",
                        "haw",
                        "he",
                        "hi",
                        "hu",
                        "is",
                        "ig",
                        "ilo",
                        "id",
                        "ga",
                        "it",
                        "ja",
                        "jp",
                        "jv",
                        "kn",
                        "kk",
                        "km",
                        "ko",
                        "lo",
                        "la",
                        "lv",
                        "ln",
                        "lt",
                        "lb",
                        "mk",
                        "mg",
                        "ms",
                        "ml",
                        "mt",
                        "mi",
                        "mr",
                        "mo",
                        "mn",
                        "mymr",
                        "ne",
                        "no",
                        "nn",
                        "oc",
                        "or",
                        "pa",
                        "ps",
                        "fa",
                        "pl",
                        "pt",
                        "pa",
                        "ro",
                        "ru",
                        "sa",
                        "sr",
                        "sn",
                        "sd",
                        "si",
                        "sk",
                        "sl",
                        "so",
                        "es",
                        "su",
                        "sw",
                        "ss",
                        "sv",
                        "tl",
                        "tg",
                        "ta",
                        "tt",
                        "te",
                        "th",
                        "bo",
                        "tn",
                        "tr",
                        "tk",
                        "uk",
                        "ur",
                        "uz",
                        "vi",
                        "cy",
                        "wo",
                        "xh",
                        "yi",
                        "yo",
                        "zu"
                      ]
                    }
                  },
                  "model": {
                    "type": "string",
                    "description": "Model you want the translation model to use to translate",
                    "default": "base",
                    "enum": [
                      "base",
                      "enhanced"
                    ]
                  },
                  "match_original_utterances": {
                    "type": "boolean",
                    "description": "Align translated utterances with the original ones",
                    "default": true
                  },
                  "lipsync": {
                    "type": "boolean",
                    "description": "Whether to apply lipsync to the translated transcription. ",
                    "default": true
                  },
                  "context_adaptation": {
                    "type": "boolean",
                    "description": "Enables or disables context-aware translation features that allow the model to adapt translations based on provided context.",
                    "default": true
                  },
                  "context": {
                    "type": "string",
                    "description": "Context information to improve translation accuracy"
                  },
                  "informal": {
                    "type": "boolean",
                    "description": "Forces the translation to use informal language forms when available in the target language.",
                    "default": false
                  }
                },
                "required": [
                  "target_languages"
                ],
                "type": "object",
                "description": "**[Beta]** Translation configuration, if `translation` is enabled"
              },
              "summarization": {
                "type": "boolean",
                "description": "**[Beta]** Enable summarization for this audio",
                "default": false
              },
              "summarization_config": {
                "properties": {
                  "type": {
                    "type": "string",
                    "description": "The type of summarization to apply",
                    "default": "general",
                    "enum": [
                      "general",
                      "bullet_points",
                      "concise"
                    ]
                  }
                },
                "type": "object",
                "description": "**[Beta]** Summarization configuration, if `summarization` is enabled"
              },
              "moderation": {
                "type": "boolean",
                "description": "**[Alpha]** Enable moderation for this audio",
                "default": false
              },
              "named_entity_recognition": {
                "type": "boolean",
                "description": "**[Alpha]** Enable named entity recognition for this audio",
                "default": false
              },
              "chapterization": {
                "type": "boolean",
                "description": "**[Alpha]** Enable chapterization for this audio",
                "default": false
              },
              "name_consistency": {
                "type": "boolean",
                "description": "**[Alpha]** Enable names consistency for this audio",
                "default": false
              },
              "custom_spelling": {
                "type": "boolean",
                "description": "**[Alpha]** Enable custom spelling for this audio",
                "default": false
              },
              "custom_spelling_config": {
                "properties": {
                  "spelling_dictionary": {
                    "type": "object",
                    "description": "The list of spelling applied on the audio transcription",
                    "example": {
                      "Gettleman": [
                        "gettleman"
                      ],
                      "SQL": [
                        "Sequel"
                      ]
                    }
                  }
                },
                "required": [
                  "spelling_dictionary"
                ],
                "type": "object",
                "description": "**[Alpha]** Custom spelling configuration, if `custom_spelling` is enabled"
              },
              "structured_data_extraction": {
                "type": "boolean",
                "description": "**[Alpha]** Enable structured data extraction for this audio",
                "default": false
              },
              "structured_data_extraction_config": {
                "properties": {
                  "classes": {
                    "description": "The list of classes to extract from the audio transcription",
                    "example": [
                      "Persons",
                      "Organizations"
                    ],
                    "minItems": 1,
                    "type": "array",
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    }
                  }
                },
                "required": [
                  "classes"
                ],
                "type": "object",
                "description": "**[Alpha]** Structured data extraction configuration, if `structured_data_extraction` is enabled"
              },
              "sentiment_analysis": {
                "type": "boolean",
                "description": "**[Alpha]** Enable sentiment analysis for this audio",
                "default": false
              },
              "audio_to_llm": {
                "type": "boolean",
                "description": "**[Alpha]** Enable audio to llm processing for this audio",
                "default": false
              },
              "audio_to_llm_config": {
                "properties": {
                  "prompts": {
                    "description": "The list of prompts applied on the audio transcription",
                    "example": [
                      "Extract the key points from the transcription"
                    ],
                    "minItems": 1,
                    "type": "array",
                    "items": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    }
                  }
                },
                "required": [
                  "prompts"
                ],
                "type": "object",
                "description": "**[Alpha]** Audio to llm configuration, if `audio_to_llm` is enabled"
              },
              "custom_metadata": {
                "type": "object",
                "description": "Custom metadata you can attach to this transcription"
              },
              "sentences": {
                "type": "boolean",
                "description": "Enable sentences for this audio",
                "default": false
              },
              "display_mode": {
                "type": "boolean",
                "description": "**[Alpha]** Allows to change the output display_mode for this audio. The output will be reordered, creating new utterances when speakers overlapped",
                "default": false
              },
              "punctuation_enhanced": {
                "type": "boolean",
                "description": "**[Alpha]** Use enhanced punctuation for this audio",
                "default": false
              },
              "language_config": {
                "properties": {
                  "languages": {
                    "type": "array",
                    "description": "If one language is set, it will be used for the transcription. Otherwise, language will be auto-detected by the model.",
                    "default": [],
                    "items": {
                      "type": "string",
                      "enum": [
                        "af",
                        "sq",
                        "am",
                        "ar",
                        "hy",
                        "as",
                        "az",
                        "ba",
                        "eu",
                        "be",
                        "bn",
                        "bs",
                        "br",
                        "bg",
                        "ca",
                        "zh",
                        "hr",
                        "cs",
                        "da",
                        "nl",
                        "en",
                        "et",
                        "fo",
                        "fi",
                        "fr",
                        "gl",
                        "ka",
                        "de",
                        "el",
                        "gu",
                        "ht",
                        "ha",
                        "haw",
                        "he",
                        "hi",
                        "hu",
                        "is",
                        "id",
                        "it",
                        "ja",
                        "jv",
                        "kn",
                        "kk",
                        "km",
                        "ko",
                        "lo",
                        "la",
                        "lv",
                        "ln",
                        "lt",
                        "lb",
                        "mk",
                        "mg",
                        "ms",
                        "ml",
                        "mt",
                        "mi",
                        "mr",
                        "mn",
                        "mymr",
                        "ne",
                        "no",
                        "nn",
                        "oc",
                        "ps",
                        "fa",
                        "pl",
                        "pt",
                        "pa",
                        "ro",
                        "ru",
                        "sa",
                        "sr",
                        "sn",
                        "sd",
                        "si",
                        "sk",
                        "sl",
                        "so",
                        "es",
                        "su",
                        "sw",
                        "sv",
                        "tl",
                        "tg",
                        "ta",
                        "tt",
                        "te",
                        "th",
                        "bo",
                        "tr",
                        "tk",
                        "uk",
                        "ur",
                        "uz",
                        "vi",
                        "cy",
                        "yi",
                        "yo",
                        "jp"
                      ]
                    }
                  },
                  "code_switching": {
                    "type": "boolean",
                    "description": "If true, language will be auto-detected on each utterance. Otherwise, language will be auto-detected on first utterance and then used for the rest of the transcription. If one language is set, this option will be ignored.",
                    "default": false
                  }
                },
                "type": "object",
                "description": "Specify the language configuration"
              }
            },
            "readOnly": true,
            "nullable": true
          },
          "rev_async": {
            "type": "object",
            "properties": {
              "metadata": {
                "maxLength": 512,
                "minLength": 0,
                "type": "string",
                "description": "Optional metadata for the job",
                "nullable": true
              },
              "delete_after": {
                "type": "string",
                "description": "Optional setting for the number of Seconds after job completion\r\nwhen the job should be auto-deleted",
                "format": "date-span",
                "nullable": true
              },
              "language": {
                "type": "string",
                "description": "Optional language setting for foreign languages",
                "nullable": true
              },
              "skip_diarization": {
                "type": "boolean",
                "description": "Optional setting for turning on/off diarization.\r\nIf not set, we will assume the value is false.",
                "nullable": true
              },
              "skip_postprocessing": {
                "type": "boolean",
                "description": "Optional setting for turning on/off postprocessing.\r\nIf not set, we will assume the value is false.",
                "nullable": true
              },
              "custom_vocabularies": {
                "maxItems": 50,
                "type": "array",
                "items": {
                  "required": [
                    "phrases"
                  ],
                  "type": "object",
                  "properties": {
                    "phrases": {
                      "maxItems": 20000,
                      "minItems": 1,
                      "type": "array",
                      "items": {
                        "type": "string"
                      }
                    }
                  },
                  "additionalProperties": false
                },
                "description": "Optional setting for passing in custom vocabularies.",
                "nullable": true
              },
              "custom_vocabulary_id": {
                "type": "string",
                "description": "The id of the prebuilt custom vocabulary job",
                "nullable": true
              },
              "strict_custom_vocabulary": {
                "type": "boolean",
                "description": "If true, only exact phrases submitted in the Rev.Ai.Api.Models.SubmitJobOptions.CustomVocabularies option will be used as custom vocabulary,\r\ni.e. phrases will not be split into individual words for processing.\r\nDefaults to true if Rev.Ai.Api.Models.SubmitJobOptions.CustomVocabularies is set.",
                "nullable": true
              },
              "skip_punctuation": {
                "type": "boolean",
                "description": "Optional setting for disabling punctuation.\r\nIf unset, the value is assumed to be false.",
                "nullable": true
              },
              "remove_disfluencies": {
                "type": "boolean",
                "description": "Optional setting for removing disfluencies\r\nIf unset the value is assumed to be false",
                "nullable": true
              },
              "remove_atmospherics": {
                "type": "boolean",
                "description": "Optional setting for removing atmospherics\r\nIf unset the value is assumed to be false",
                "nullable": true
              },
              "filter_profanity": {
                "type": "boolean",
                "description": "Optional setting for removing profanities\r\nIf unset the value is assumed to be false",
                "nullable": true
              },
              "add_data_labels": {
                "type": "boolean",
                "description": "Optional setting for adding data classification labels\r\nIf unset the value is assumed to be false",
                "nullable": true
              },
              "enable_redaction": {
                "type": "boolean",
                "description": "Optional setting for redacting certain data labels\r\nIf unset the value is assumed to be false",
                "nullable": true
              },
              "speaker_channels_count": {
                "maximum": 8,
                "minimum": 1,
                "type": "integer",
                "description": "Optional speaker channels count used to indicate how many individual channels\r\nto transcribe for a given audio",
                "format": "int32",
                "nullable": true
              },
              "speakers_count": {
                "maximum": 2147483647,
                "minimum": 1,
                "type": "integer",
                "description": "Optional count of speakers in the audio to improve diarization accuracy",
                "format": "int32",
                "nullable": true
              },
              "alternatives_count": {
                "maximum": 3,
                "minimum": 0,
                "type": "integer",
                "description": "Optional count of alternatives to generate",
                "format": "int32",
                "nullable": true
              },
              "deletion_length_penalty": {
                "maximum": 100,
                "minimum": -100,
                "type": "integer",
                "format": "int32",
                "nullable": true
              },
              "chunk_size": {
                "type": "string",
                "description": "Optional chunk size to be sent to Revspeech for processing",
                "format": "date-span",
                "nullable": true
              },
              "transcriber": {
                "enum": [
                  0,
                  1,
                  2,
                  3,
                  4,
                  5,
                  6,
                  7,
                  8,
                  9,
                  10,
                  11,
                  12,
                  13,
                  14,
                  15,
                  16,
                  17
                ],
                "type": "integer",
                "format": "int32"
              },
              "verbatim": {
                "type": "boolean",
                "description": "Instructs Revver to transcribe audio with all details including disfluencies and other verbal interactions\r\nsuch as laughter",
                "nullable": true
              },
              "rush": {
                "type": "boolean",
                "description": "Whether human order should be rushed at a greater cost to the customer",
                "nullable": true
              },
              "segments_to_transcribe": {
                "type": "array",
                "items": {
                  "required": [
                    "end",
                    "start"
                  ],
                  "type": "object",
                  "properties": {
                    "start": {
                      "type": "string",
                      "format": "date-span"
                    },
                    "end": {
                      "type": "string",
                      "format": "date-span"
                    }
                  },
                  "additionalProperties": false
                },
                "description": "Specific segments of the file to be transcribed by a human",
                "nullable": true
              },
              "test_mode": {
                "type": "boolean",
                "description": "Whether human order is test mode and should return a dummy transcript",
                "nullable": true
              },
              "speaker_names": {
                "type": "array",
                "items": {
                  "required": [
                    "displayName"
                  ],
                  "type": "object",
                  "properties": {
                    "display_name": {
                      "maxLength": 50,
                      "minLength": 1,
                      "type": "string"
                    }
                  },
                  "additionalProperties": false
                },
                "description": "Speaker names for human transcription",
                "nullable": true
              },
              "predict_topics": {
                "type": "boolean",
                "description": "Whether to predict topics while performing speech rec",
                "nullable": true
              },
              "top_nwords": {
                "maximum": 100,
                "minimum": 0,
                "type": "integer",
                "description": "Returns the top n words of a transcript. Defaults to 0",
                "format": "int32",
                "nullable": true
              },
              "forced_alignment": {
                "type": "boolean",
                "description": "Whether improved alignment should be used with transcription",
                "nullable": true
              },
              "enable_fusion": {
                "type": "boolean",
                "description": "Whether transcription should be done with fusion",
                "nullable": true
              },
              "domain": {
                "enum": [
                  0,
                  1
                ],
                "type": "integer",
                "format": "int32"
              },
              "apply_duration_padding": {
                "type": "boolean",
                "description": "If set adds one second of silence to the audio at the end",
                "nullable": true
              },
              "diarization_type": {
                "enum": [
                  0,
                  10,
                  20
                ],
                "type": "integer",
                "format": "int32"
              },
              "summarization_config": {
                "type": "object",
                "properties": {
                  "prompt": {
                    "type": "string",
                    "description": "User defined prompt.",
                    "nullable": true
                  },
                  "model": {
                    "enum": [
                      0,
                      1
                    ],
                    "type": "integer",
                    "description": "Summarization model options for Rev.ai API",
                    "format": "int32"
                  },
                  "type": {
                    "enum": [
                      0,
                      1
                    ],
                    "type": "integer",
                    "description": "Summarization formatting options.",
                    "format": "int32"
                  }
                },
                "additionalProperties": false,
                "description": "Summarization options."
              },
              "captions_config": {
                "type": "object",
                "additionalProperties": false,
                "description": "Caption options."
              },
              "translation_config": {
                "required": [
                  "targetLanguages"
                ],
                "type": "object",
                "properties": {
                  "target_languages": {
                    "maxItems": 5,
                    "minItems": 1,
                    "type": "array",
                    "items": {
                      "required": [
                        "language"
                      ],
                      "type": "object",
                      "properties": {
                        "model": {
                          "enum": [
                            0,
                            1
                          ],
                          "type": "integer",
                          "description": "Defines the type of models supported to translated the content",
                          "format": "int32"
                        },
                        "language": {
                          "minLength": 1,
                          "type": "string",
                          "description": "Target language"
                        }
                      },
                      "additionalProperties": false,
                      "description": "Options for translation as part of Async job request for specific target language"
                    },
                    "description": "Target languages"
                  }
                },
                "additionalProperties": false,
                "description": "Options for translation as part of Async job request"
              }
            },
            "additionalProperties": false,
            "readOnly": true,
            "nullable": true
          },
          "speechmatics_async": {
            "description": "JSON object that contains various groups of job configuration\nparameters. Based on the value of `type`, a type-specific object\nsuch as `transcription_config` is required to be present to\nspecify all configuration settings or parameters needed to\nprocess the job inputs as expected.\n\nIf the results of the job are to be forwarded on completion,\n`notification_config` can be provided with a list of callbacks\nto be made; no assumptions should be made about the order in\nwhich they will occur.\n\nCustomer specific job details or metadata can be supplied in\n`tracking`, and this information will be available where\npossible in the job results and in callbacks.\n",
            "properties": {
              "alignment_config": {
                "required": [
                  "language"
                ],
                "properties": {
                  "language": {
                    "type": "string"
                  }
                },
                "example": {
                  "language": "en"
                }
              },
              "transcription_config": {
                "required": [
                  "language"
                ],
                "properties": {
                  "language": {
                    "type": "string",
                    "description": "Language model to process the audio input, normally specified as an ISO language code"
                  },
                  "domain": {
                    "type": "string",
                    "description": "Request a specialized model based on 'language' but optimized for a particular field, e.g. \"finance\" or \"medical\"."
                  },
                  "output_locale": {
                    "type": "string",
                    "description": "Language locale to be used when generating the transcription output, normally specified as an ISO language code"
                  },
                  "operating_point": {
                    "type": "string",
                    "enum": [
                      "standard",
                      "enhanced"
                    ]
                  },
                  "additional_vocab": {
                    "type": "array",
                    "x-omitempty": true,
                    "items": {
                      "type": "object",
                      "required": [
                        "content"
                      ],
                      "properties": {
                        "content": {
                          "type": "string"
                        },
                        "sounds_like": {
                          "type": "array",
                          "x-omitempty": true,
                          "items": {
                            "type": "string"
                          }
                        }
                      }
                    },
                    "description": "List of custom words or phrases that should be recognized. Alternative pronunciations can be specified to aid recognition."
                  },
                  "punctuation_overrides": {
                    "properties": {
                      "sensitivity": {
                        "type": "number",
                        "format": "float",
                        "minimum": 0,
                        "maximum": 1,
                        "description": "Ranges between zero and one. Higher values will produce more punctuation. The default is 0.5."
                      },
                      "permitted_marks": {
                        "type": "array",
                        "items": {
                          "type": "string",
                          "pattern": "^(.|all)$"
                        },
                        "description": "The punctuation marks which the client is prepared to accept in transcription output, or the special value 'all' (the default). Unsupported marks are ignored. This value is used to guide the transcription process."
                      }
                    },
                    "description": "Control punctuation settings."
                  },
                  "diarization": {
                    "type": "string",
                    "enum": [
                      "none",
                      "speaker",
                      "channel"
                    ],
                    "description": "Specify whether speaker or channel labels are added to the transcript.\nThe default is `none`.\n  - **none**: no speaker or channel labels are added.\n  - **speaker**: speaker attribution is performed based on acoustic matching;\n             all input channels are mixed into a single stream for processing.\n  - **channel**: multiple input channels are processed individually and collated\n            into a single transcript."
                  },
                  "channel_diarization_labels": {
                    "type": "array",
                    "x-omitempty": true,
                    "items": {
                      "type": "string",
                      "pattern": "^[A-Za-z0-9._]+$"
                    },
                    "description": "Transcript labels to use when using collating separate input channels."
                  },
                  "enable_entities": {
                    "type": "boolean",
                    "description": "Include additional 'entity' objects in the transcription results (e.g. dates, numbers) and their original spoken form. These entities are interleaved with other types of results. The concatenation of these words is represented as a single entity with the concatenated written form present in the 'content' field. The entities contain a 'spoken_form' field, which can be used in place of the corresponding 'word' type results, in case a spoken form is preferred to a written form. They also contain a 'written_form', which can be used instead of the entity, if you want a breakdown of the words without spaces. They can still contain non-breaking spaces and other special whitespace characters, as they are considered part of the word for the formatting output. In case of a written_form, the individual word times are estimated and might not be accurate if the order of the words in the written form does not correspond to the order they were actually spoken (such as 'one hundred million dollars' and '$100 million')."
                  },
                  "max_delay_mode": {
                    "type": "string",
                    "enum": [
                      "fixed",
                      "flexible"
                    ],
                    "description": "Whether or not to enable flexible endpointing and allow the entity to continue to be spoken."
                  },
                  "transcript_filtering_config": {
                    "description": "Configuration for applying filtering to the transcription",
                    "properties": {
                      "remove_disfluencies": {
                        "type": "boolean",
                        "description": "If true, words that are identified as disfluencies will be removed from the transcript. If false (default), they are tagged in the transcript as 'disfluency'."
                      },
                      "replacements": {
                        "type": "array",
                        "x-omitempty": true,
                        "items": {
                          "additionalProperties": false,
                          "type": "object",
                          "required": [
                            "from",
                            "to"
                          ],
                          "properties": {
                            "from": {
                              "type": "string"
                            },
                            "to": {
                              "type": "string"
                            }
                          }
                        },
                        "description": "A list of replacements to apply to the transcript. Each replacement is a pair of strings, where the first string is the pattern to be replaced and the second string is the replacement text."
                      }
                    }
                  },
                  "speaker_diarization_config": {
                    "description": "Configuration for speaker diarization",
                    "properties": {
                      "prefer_current_speaker": {
                        "type": "boolean",
                        "description": "If true, the algorithm will prefer to stay with the current active speaker if it is a close enough match, even if other speakers may be closer.  This is useful for cases where we can flip incorrectly between similar speakers during a single speaker section.\""
                      },
                      "speaker_sensitivity": {
                        "type": "number",
                        "format": "float",
                        "minimum": 0,
                        "maximum": 1,
                        "description": "Controls how sensitive the algorithm is in terms of keeping similar speakers separate, as opposed to combining them into a single speaker.  Higher values will typically lead to more speakers, as the degree of difference between speakers in order to allow them to remain distinct will be lower.  A lower value for this parameter will conversely guide the algorithm towards being less sensitive in terms of retaining similar speakers, and as such may lead to fewer speakers overall.  The default is 0.5."
                      }
                    }
                  }
                },
                "example": {
                  "language": "en",
                  "output_locale": "en-GB",
                  "additional_vocab": [
                    {
                      "content": "Speechmatics",
                      "sounds_like": [
                        "speechmatics"
                      ]
                    },
                    {
                      "content": "gnocchi",
                      "sounds_like": [
                        "nyohki",
                        "nokey",
                        "nochi"
                      ]
                    },
                    {
                      "content": "CEO",
                      "sounds_like": [
                        "C.E.O."
                      ]
                    },
                    {
                      "content": "financial crisis"
                    }
                  ],
                  "diarization": "channel",
                  "channel_diarization_labels": [
                    "Caller",
                    "Agent"
                  ]
                }
              },
              "tracking": {
                "properties": {
                  "title": {
                    "type": "string",
                    "description": "The title of the job."
                  },
                  "reference": {
                    "type": "string",
                    "description": "External system reference."
                  },
                  "tags": {
                    "type": "array",
                    "x-omitempty": true,
                    "items": {
                      "type": "string"
                    }
                  },
                  "details": {
                    "type": "object",
                    "description": "Customer-defined JSON structure."
                  }
                },
                "example": {
                  "title": "ACME Q12018 Earnings Call",
                  "reference": "/data/clients/ACME/statements/segs/2018Q1-seg8",
                  "tags": [
                    "quick-review",
                    "segment"
                  ],
                  "details": {
                    "client": "ACME Corp",
                    "segment": 8,
                    "seg_start": 963.201,
                    "seg_end": 1091.481
                  }
                }
              },
              "output_config": {
                "x-omitempty": true,
                "type": "object",
                "properties": {
                  "srt_overrides": {
                    "description": "Parameters that override default values of srt conversion. max_line_length: sets maximum count of characters per subtitle line including white space. max_lines: sets maximum count of lines in a subtitle section.",
                    "type": "object",
                    "properties": {
                      "max_line_length": {
                        "type": "integer"
                      },
                      "max_lines": {
                        "type": "integer"
                      }
                    }
                  }
                }
              },
              "translation_config": {
                "required": [
                  "target_languages"
                ],
                "properties": {
                  "target_languages": {
                    "type": "array",
                    "maxItems": 5,
                    "items": {
                      "type": "string"
                    }
                  }
                }
              },
              "language_identification_config": {
                "properties": {
                  "expected_languages": {
                    "type": "array",
                    "x-omitempty": true,
                    "items": {
                      "type": "string"
                    }
                  },
                  "low_confidence_action": {
                    "type": "string",
                    "enum": [
                      "allow",
                      "reject",
                      "use_default_language"
                    ],
                    "description": "Action to take if all of the predicted languages are below the confidence threshold"
                  },
                  "default_language": {
                    "type": "string"
                  }
                }
              },
              "summarization_config": {
                "properties": {
                  "content_type": {
                    "type": "string",
                    "enum": [
                      "auto",
                      "informative",
                      "conversational"
                    ]
                  },
                  "summary_length": {
                    "type": "string",
                    "enum": [
                      "brief",
                      "detailed"
                    ]
                  },
                  "summary_type": {
                    "type": "string",
                    "enum": [
                      "paragraphs",
                      "bullets"
                    ]
                  }
                }
              },
              "sentiment_analysis_config": {
                "type": "object"
              },
              "topic_detection_config": {
                "properties": {
                  "topics": {
                    "x-omitempty": true,
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              },
              "auto_chapters_config": {
                "type": "object"
              },
              "audio_events_config": {
                "x-omitempty": true,
                "type": "object",
                "properties": {
                  "types": {
                    "x-omitempty": true,
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              }
            },
            "readOnly": true,
            "nullable": true
          },
          "recallai_async": {
            "type": "object",
            "properties": {
              "language_code": {
                "enum": [
                  "auto",
                  "bg",
                  "ca",
                  "cs",
                  "da",
                  "de",
                  "el",
                  "en",
                  "en_au",
                  "en_uk",
                  "en_us",
                  "es",
                  "et",
                  "fi",
                  "fr",
                  "he",
                  "hi",
                  "hr",
                  "hu",
                  "id",
                  "it",
                  "ja",
                  "ko",
                  "lt",
                  "lv",
                  "ms",
                  "nl",
                  "no",
                  "pl",
                  "pt",
                  "ro",
                  "ru",
                  "sk",
                  "sv",
                  "th",
                  "tr",
                  "uk",
                  "vi",
                  "zh"
                ],
                "type": "string",
                "default": "auto",
                "description": "Must be `en` in low latency mode. Docs: https://docs.recall.ai/docs/recallai-transcription\n\n* `auto` - auto\n* `bg` - bg\n* `ca` - ca\n* `cs` - cs\n* `da` - da\n* `de` - de\n* `el` - el\n* `en` - en\n* `en_au` - en_au\n* `en_uk` - en_uk\n* `en_us` - en_us\n* `es` - es\n* `et` - et\n* `fi` - fi\n* `fr` - fr\n* `he` - he\n* `hi` - hi\n* `hr` - hr\n* `hu` - hu\n* `id` - id\n* `it` - it\n* `ja` - ja\n* `ko` - ko\n* `lt` - lt\n* `lv` - lv\n* `ms` - ms\n* `nl` - nl\n* `no` - no\n* `pl` - pl\n* `pt` - pt\n* `ro` - ro\n* `ru` - ru\n* `sk` - sk\n* `sv` - sv\n* `th` - th\n* `tr` - tr\n* `uk` - uk\n* `vi` - vi\n* `zh` - zh"
              },
              "spelling": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/RecallaiSpellingEntry"
                },
                "description": "List of text strings to find/replace in the transcript."
              },
              "key_terms": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "Increases the chances that these terms appear in the transcript over some sound-alikes."
              },
              "filter_profanity": {
                "type": "boolean",
                "default": false
              }
            },
            "readOnly": true,
            "nullable": true,
            "title": "Recall.ai async transcription Settings",
            "description": "Docs: https://docs.recall.ai/docs/recallai-transcription"
          },
          "google_speech_v2_async": {
            "description": "Docs: https://docs.cloud.google.com/speech-to-text/docs/reference/rest/v2/projects.locations.recognizers/batchRecognize",
            "type": "object",
            "properties": {
              "recognizer": {
                "description": "Required. The name of the Recognizer to use during recognition. The expected format is `projects/{project}/locations/{location}/recognizers/{recognizer}`. The {recognizer} segment may be set to `_` to use an empty implicit Recognizer.",
                "type": "string",
                "default": "projects/{project_id}/locations/global/recognizers/_"
              },
              "config": {
                "description": "Provides information to the Recognizer that specifies how to process the recognition request.",
                "type": "object",
                "properties": {
                  "autoDecodingConfig": {
                    "description": "Automatically detected decoding parameters. Supported for the following encodings: * WAV_LINEAR16: 16-bit signed little-endian PCM samples in a WAV container. * WAV_MULAW: 8-bit companded mulaw samples in a WAV container. * WAV_ALAW: 8-bit companded alaw samples in a WAV container. * RFC4867_5_AMR: AMR frames with an rfc4867.5 header. * RFC4867_5_AMRWB: AMR-WB frames with an rfc4867.5 header. * FLAC: FLAC frames in the \"native FLAC\" container format. * MP3: MPEG audio frames with optional (ignored) ID3 metadata. * OGG_OPUS: Opus audio frames in an Ogg container. * WEBM_OPUS: Opus audio frames in a WebM container. * MP4_AAC: AAC audio frames in an MP4 container. * M4A_AAC: AAC audio frames in an M4A container. * MOV_AAC: AAC audio frames in an MOV container.",
                    "type": "object",
                    "properties": {}
                  },
                  "explicitDecodingConfig": {
                    "description": "Explicitly specified decoding parameters.",
                    "type": "object",
                    "properties": {
                      "encoding": {
                        "description": "Required. Encoding of the audio data sent for recognition.",
                        "type": "string",
                        "enum": [
                          "AUDIO_ENCODING_UNSPECIFIED",
                          "LINEAR16",
                          "MULAW",
                          "ALAW",
                          "AMR",
                          "AMR_WB",
                          "FLAC",
                          "MP3",
                          "OGG_OPUS",
                          "WEBM_OPUS",
                          "MP4_AAC",
                          "M4A_AAC",
                          "MOV_AAC"
                        ]
                      },
                      "sampleRateHertz": {
                        "description": "Optional. Sample rate in Hertz of the audio data sent for recognition. Valid values are: 8000-48000, and 16000 is optimal. For best results, set the sampling rate of the audio source to 16000 Hz. If that's not possible, use the native sample rate of the audio source (instead of resampling). Note that this field is marked as OPTIONAL for backward compatibility reasons. It is (and has always been) effectively REQUIRED.",
                        "type": "integer",
                        "format": "int32"
                      },
                      "audioChannelCount": {
                        "description": "Optional. Number of channels present in the audio data sent for recognition. Note that this field is marked as OPTIONAL for backward compatibility reasons. It is (and has always been) effectively REQUIRED. The maximum allowed value is 8.",
                        "type": "integer",
                        "format": "int32"
                      }
                    }
                  },
                  "model": {
                    "description": "Optional. Which model to use for recognition requests. Select the model best suited to your domain to get best results. Guidance for choosing which model to use can be found in the [Transcription Models Documentation](https://cloud.google.com/speech-to-text/v2/docs/transcription-model) and the models supported in each region can be found in the [Table Of Supported Models](https://cloud.google.com/speech-to-text/v2/docs/speech-to-text-supported-languages).",
                    "type": "string"
                  },
                  "languageCodes": {
                    "description": "Optional. The language of the supplied audio as a [BCP-47](https://www.rfc-editor.org/rfc/bcp/bcp47.txt) language tag. Language tags are normalized to BCP-47 before they are used eg \"en-us\" becomes \"en-US\". Supported languages for each model are listed in the [Table of Supported Models](https://cloud.google.com/speech-to-text/v2/docs/speech-to-text-supported-languages). If additional languages are provided, recognition result will contain recognition in the most likely language detected. The recognition result will include the language tag of the language detected in the audio.",
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "features": {
                    "description": "Available recognition features.",
                    "type": "object",
                    "properties": {
                      "profanityFilter": {
                        "description": "If set to `true`, the server will attempt to filter out profanities, replacing all but the initial character in each filtered word with asterisks, for instance, \"f***\". If set to `false` or omitted, profanities won't be filtered out.",
                        "type": "boolean"
                      },
                      "enableWordTimeOffsets": {
                        "description": "If `true`, the top result includes a list of words and the start and end time offsets (timestamps) for those words. If `false`, no word-level time offset information is returned. The default is `false`.",
                        "type": "boolean"
                      },
                      "enableWordConfidence": {
                        "description": "If `true`, the top result includes a list of words and the confidence for those words. If `false`, no word-level confidence information is returned. The default is `false`.",
                        "type": "boolean"
                      },
                      "enableAutomaticPunctuation": {
                        "description": "If `true`, adds punctuation to recognition result hypotheses. This feature is only available in select languages. The default `false` value does not add punctuation to result hypotheses.",
                        "type": "boolean"
                      },
                      "enableSpokenPunctuation": {
                        "description": "The spoken punctuation behavior for the call. If `true`, replaces spoken punctuation with the corresponding symbols in the request. For example, \"how are you question mark\" becomes \"how are you?\". See https://cloud.google.com/speech-to-text/docs/spoken-punctuation for support. If `false`, spoken punctuation is not replaced.",
                        "type": "boolean"
                      },
                      "enableSpokenEmojis": {
                        "description": "The spoken emoji behavior for the call. If `true`, adds spoken emoji formatting for the request. This will replace spoken emojis with the corresponding Unicode symbols in the final transcript. If `false`, spoken emojis are not replaced.",
                        "type": "boolean"
                      },
                      "multiChannelMode": {
                        "description": "Mode for recognizing multi-channel audio.",
                        "type": "string",
                        "enum": [
                          "MULTI_CHANNEL_MODE_UNSPECIFIED",
                          "SEPARATE_RECOGNITION_PER_CHANNEL"
                        ]
                      },
                      "diarizationConfig": {
                        "description": "Configuration to enable speaker diarization.",
                        "type": "object",
                        "properties": {
                          "minSpeakerCount": {
                            "description": "Optional. The system automatically determines the number of speakers. This value is not currently used.",
                            "type": "integer",
                            "format": "int32"
                          },
                          "maxSpeakerCount": {
                            "description": "Optional. The system automatically determines the number of speakers. This value is not currently used.",
                            "type": "integer",
                            "format": "int32"
                          }
                        }
                      },
                      "maxAlternatives": {
                        "description": "Maximum number of recognition hypotheses to be returned. The server may return fewer than `max_alternatives`. Valid values are `0`-`30`. A value of `0` or `1` will return a maximum of one. If omitted, will return a maximum of one.",
                        "type": "integer",
                        "format": "int32"
                      }
                    }
                  },
                  "adaptation": {
                    "description": "Provides \"hints\" to the speech recognizer to favor specific words and phrases in the results. PhraseSets can be specified as an inline resource, or a reference to an existing PhraseSet resource.",
                    "type": "object",
                    "properties": {
                      "phraseSets": {
                        "description": "A list of inline or referenced PhraseSets.",
                        "type": "array",
                        "items": {
                          "description": "A biasing PhraseSet, which can be either a string referencing the name of an existing PhraseSets resource, or an inline definition of a PhraseSet.",
                          "type": "object",
                          "properties": {
                            "phraseSet": {
                              "description": "The name of an existing PhraseSet resource. The user must have read access to the resource and it must not be deleted.",
                              "type": "string"
                            },
                            "inlinePhraseSet": {
                              "description": "PhraseSet for biasing in speech recognition. A PhraseSet is used to provide \"hints\" to the speech recognizer to favor specific words and phrases in the results.",
                              "type": "object",
                              "properties": {
                                "name": {
                                  "description": "Output only. Identifier. The resource name of the PhraseSet. Format: `projects/{project}/locations/{location}/phraseSets/{phrase_set}`.",
                                  "readOnly": true,
                                  "type": "string"
                                },
                                "uid": {
                                  "description": "Output only. System-assigned unique identifier for the PhraseSet.",
                                  "readOnly": true,
                                  "type": "string"
                                },
                                "phrases": {
                                  "description": "A list of word and phrases.",
                                  "type": "array",
                                  "items": {
                                    "description": "A Phrase contains words and phrase \"hints\" so that the speech recognition is more likely to recognize them. This can be used to improve the accuracy for specific words and phrases, for example, if specific commands are typically spoken by the user. This can also be used to add additional words to the vocabulary of the recognizer. List items can also include CustomClass references containing groups of words that represent common concepts that occur in natural language.",
                                    "type": "object",
                                    "properties": {
                                      "value": {
                                        "description": "The phrase itself.",
                                        "type": "string"
                                      },
                                      "boost": {
                                        "description": "Hint Boost. Overrides the boost set at the phrase set level. Positive value will increase the probability that a specific phrase will be recognized over other similar sounding phrases. The higher the boost, the higher the chance of false positive recognition as well. Negative boost values would correspond to anti-biasing. Anti-biasing is not enabled, so negative boost values will return an error. Boost values must be between 0 and 20. Any values outside that range will return an error. We recommend using a binary search approach to finding the optimal value for your use case as well as adding phrases both with and without boost to your requests.",
                                        "type": "number",
                                        "format": "float"
                                      }
                                    }
                                  }
                                },
                                "boost": {
                                  "description": "Hint Boost. Positive value will increase the probability that a specific phrase will be recognized over other similar sounding phrases. The higher the boost, the higher the chance of false positive recognition as well. Valid `boost` values are between 0 (exclusive) and 20. We recommend using a binary search approach to finding the optimal value for your use case as well as adding phrases both with and without boost to your requests.",
                                  "type": "number",
                                  "format": "float"
                                },
                                "displayName": {
                                  "description": "User-settable, human-readable name for the PhraseSet. Must be 63 characters or less.",
                                  "type": "string"
                                },
                                "state": {
                                  "description": "Output only. The PhraseSet lifecycle state.",
                                  "readOnly": true,
                                  "type": "string",
                                  "enum": [
                                    "STATE_UNSPECIFIED",
                                    "ACTIVE",
                                    "DELETED"
                                  ]
                                },
                                "createTime": {
                                  "description": "Output only. Creation time.",
                                  "readOnly": true,
                                  "type": "string",
                                  "format": "google-datetime"
                                },
                                "updateTime": {
                                  "description": "Output only. The most recent time this resource was modified.",
                                  "readOnly": true,
                                  "type": "string",
                                  "format": "google-datetime"
                                },
                                "deleteTime": {
                                  "description": "Output only. The time at which this resource was requested for deletion.",
                                  "readOnly": true,
                                  "type": "string",
                                  "format": "google-datetime"
                                },
                                "expireTime": {
                                  "description": "Output only. The time at which this resource will be purged.",
                                  "readOnly": true,
                                  "type": "string",
                                  "format": "google-datetime"
                                },
                                "annotations": {
                                  "description": "Allows users to store small amounts of arbitrary data. Both the key and the value must be 63 characters or less each. At most 100 annotations.",
                                  "type": "object",
                                  "additionalProperties": {
                                    "type": "string"
                                  }
                                },
                                "etag": {
                                  "description": "Output only. This checksum is computed by the server based on the value of other fields. This may be sent on update, undelete, and delete requests to ensure the client has an up-to-date value before proceeding.",
                                  "readOnly": true,
                                  "type": "string"
                                },
                                "reconciling": {
                                  "description": "Output only. Whether or not this PhraseSet is in the process of being updated.",
                                  "readOnly": true,
                                  "type": "boolean"
                                },
                                "kmsKeyName": {
                                  "description": "Output only. The [KMS key name](https://cloud.google.com/kms/docs/resource-hierarchy#keys) with which the PhraseSet is encrypted. The expected format is `projects/{project}/locations/{location}/keyRings/{key_ring}/cryptoKeys/{crypto_key}`.",
                                  "readOnly": true,
                                  "type": "string"
                                },
                                "kmsKeyVersionName": {
                                  "description": "Output only. The [KMS key version name](https://cloud.google.com/kms/docs/resource-hierarchy#key_versions) with which the PhraseSet is encrypted. The expected format is `projects/{project}/locations/{location}/keyRings/{key_ring}/cryptoKeys/{crypto_key}/cryptoKeyVersions/{crypto_key_version}`.",
                                  "readOnly": true,
                                  "type": "string"
                                }
                              }
                            }
                          }
                        }
                      },
                      "customClasses": {
                        "description": "A list of inline CustomClasses. Existing CustomClass resources can be referenced directly in a PhraseSet.",
                        "type": "array",
                        "items": {
                          "description": "CustomClass for biasing in speech recognition. Used to define a set of words or phrases that represents a common concept or theme likely to appear in your audio, for example a list of passenger ship names.",
                          "type": "object",
                          "properties": {
                            "name": {
                              "description": "Output only. Identifier. The resource name of the CustomClass. Format: `projects/{project}/locations/{location}/customClasses/{custom_class}`.",
                              "readOnly": true,
                              "type": "string"
                            },
                            "uid": {
                              "description": "Output only. System-assigned unique identifier for the CustomClass.",
                              "readOnly": true,
                              "type": "string"
                            },
                            "displayName": {
                              "description": "Optional. User-settable, human-readable name for the CustomClass. Must be 63 characters or less.",
                              "type": "string"
                            },
                            "items": {
                              "description": "A collection of class items.",
                              "type": "array",
                              "items": {
                                "description": "An item of the class.",
                                "type": "object",
                                "properties": {
                                  "value": {
                                    "description": "The class item's value.",
                                    "type": "string"
                                  }
                                }
                              }
                            },
                            "state": {
                              "description": "Output only. The CustomClass lifecycle state.",
                              "readOnly": true,
                              "type": "string",
                              "enum": [
                                "STATE_UNSPECIFIED",
                                "ACTIVE",
                                "DELETED"
                              ]
                            },
                            "createTime": {
                              "description": "Output only. Creation time.",
                              "readOnly": true,
                              "type": "string",
                              "format": "google-datetime"
                            },
                            "updateTime": {
                              "description": "Output only. The most recent time this resource was modified.",
                              "readOnly": true,
                              "type": "string",
                              "format": "google-datetime"
                            },
                            "deleteTime": {
                              "description": "Output only. The time at which this resource was requested for deletion.",
                              "readOnly": true,
                              "type": "string",
                              "format": "google-datetime"
                            },
                            "expireTime": {
                              "description": "Output only. The time at which this resource will be purged.",
                              "readOnly": true,
                              "type": "string",
                              "format": "google-datetime"
                            },
                            "annotations": {
                              "description": "Optional. Allows users to store small amounts of arbitrary data. Both the key and the value must be 63 characters or less each. At most 100 annotations.",
                              "type": "object",
                              "additionalProperties": {
                                "type": "string"
                              }
                            },
                            "etag": {
                              "description": "Output only. This checksum is computed by the server based on the value of other fields. This may be sent on update, undelete, and delete requests to ensure the client has an up-to-date value before proceeding.",
                              "readOnly": true,
                              "type": "string"
                            },
                            "reconciling": {
                              "description": "Output only. Whether or not this CustomClass is in the process of being updated.",
                              "readOnly": true,
                              "type": "boolean"
                            },
                            "kmsKeyName": {
                              "description": "Output only. The [KMS key name](https://cloud.google.com/kms/docs/resource-hierarchy#keys) with which the CustomClass is encrypted. The expected format is `projects/{project}/locations/{location}/keyRings/{key_ring}/cryptoKeys/{crypto_key}`.",
                              "readOnly": true,
                              "type": "string"
                            },
                            "kmsKeyVersionName": {
                              "description": "Output only. The [KMS key version name](https://cloud.google.com/kms/docs/resource-hierarchy#key_versions) with which the CustomClass is encrypted. The expected format is `projects/{project}/locations/{location}/keyRings/{key_ring}/cryptoKeys/{crypto_key}/cryptoKeyVersions/{crypto_key_version}`.",
                              "readOnly": true,
                              "type": "string"
                            }
                          }
                        }
                      }
                    }
                  },
                  "transcriptNormalization": {
                    "description": "Transcription normalization configuration. Use transcription normalization to automatically replace parts of the transcript with phrases of your choosing. For StreamingRecognize, this normalization only applies to stable partial transcripts (stability > 0.8) and final transcripts.",
                    "type": "object",
                    "properties": {
                      "entries": {
                        "description": "A list of replacement entries. We will perform replacement with one entry at a time. For example, the second entry in [\"cat\" => \"dog\", \"mountain cat\" => \"mountain dog\"] will never be applied because we will always process the first entry before it. At most 100 entries.",
                        "type": "array",
                        "items": {
                          "description": "A single replacement configuration.",
                          "type": "object",
                          "properties": {
                            "search": {
                              "description": "What to replace. Max length is 100 characters.",
                              "type": "string"
                            },
                            "replace": {
                              "description": "What to replace with. Max length is 100 characters.",
                              "type": "string"
                            },
                            "caseSensitive": {
                              "description": "Whether the search is case sensitive.",
                              "type": "boolean"
                            }
                          }
                        }
                      }
                    }
                  },
                  "translationConfig": {
                    "description": "Translation configuration. Use to translate the given audio into text for the desired language.",
                    "type": "object",
                    "properties": {
                      "targetLanguage": {
                        "description": "Required. The language code to translate to.",
                        "type": "string"
                      }
                    }
                  },
                  "denoiserConfig": {
                    "description": "Denoiser config. May not be supported for all models and may have no effect.",
                    "type": "object",
                    "properties": {
                      "denoiseAudio": {
                        "description": "Denoise audio before sending to the transcription model.",
                        "type": "boolean"
                      },
                      "snrThreshold": {
                        "description": "Signal-to-Noise Ratio (SNR) threshold for the denoiser. Here SNR means the loudness of the speech signal. Audio with an SNR below this threshold, meaning the speech is too quiet, will be prevented from being sent to the transcription model. If snr_threshold=0, no filtering will be applied.",
                        "type": "number",
                        "format": "float"
                      }
                    }
                  }
                }
              },
              "configMask": {
                "description": "The list of fields in config that override the values in the default_recognition_config of the recognizer during this recognition request. If no mask is provided, all given fields in config override the values in the recognizer for this recognition request. If a mask is provided, only the fields listed in the mask override the config in the recognizer for this recognition request. If a wildcard (`*`) is provided, config completely overrides and replaces the config in the recognizer for this recognition request.",
                "type": "string",
                "format": "google-fieldmask"
              }
            },
            "readOnly": true,
            "nullable": true,
            "title": "Google Cloud Speech To Text V2 transcription service"
          },
          "aws_transcribe_async": {
            "type": "object",
            "readOnly": true,
            "nullable": true,
            "title": "AWS Transcribe batch transcription service",
            "description": "Docs: https://docs.aws.amazon.com/transcribe/latest/APIReference/API_StartTranscriptionJob.html"
          },
          "elevenlabs_async": {
            "properties": {
              "model_id": {
                "type": "string",
                "enum": [
                  "scribe_v1",
                  "scribe_v2"
                ],
                "title": "Model Id",
                "description": "The ID of the model to use for transcription."
              },
              "language_code": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "string",
                    "nullable": true
                  }
                ],
                "title": "Language Code",
                "description": "An ISO-639-1 or ISO-639-3 language_code corresponding to the language of the audio file. Can sometimes improve transcription performance if known beforehand. Defaults to null, in this case the language is predicted automatically."
              },
              "tag_audio_events": {
                "type": "boolean",
                "title": "Tag Audio Events",
                "description": "Whether to tag audio events like (laughter), (footsteps), etc. in the transcription.",
                "default": true
              },
              "num_speakers": {
                "anyOf": [
                  {
                    "type": "integer",
                    "maximum": 32,
                    "minimum": 1
                  },
                  {
                    "type": "string",
                    "nullable": true
                  }
                ],
                "title": "Num Speakers",
                "description": "The maximum amount of speakers talking in the uploaded file. Can help with predicting who speaks when. The maximum amount of speakers that can be predicted is 32. Defaults to null, in this case the amount of speakers is set to the maximum value the model supports."
              },
              "diarize": {
                "type": "boolean",
                "title": "Diarize",
                "description": "Whether to annotate which speaker is currently talking in the uploaded file.",
                "default": false
              },
              "diarization_threshold": {
                "anyOf": [
                  {
                    "type": "number",
                    "maximum": 0.4,
                    "minimum": 0.1
                  },
                  {
                    "type": "string",
                    "nullable": true
                  }
                ],
                "title": "Diarization Threshold",
                "description": "Diarization threshold to apply during speaker diarization. A higher value means there will be a lower chance of one speaker being diarized as two different speakers but also a higher chance of two different speakers being diarized as one speaker (less total speakers predicted). A low value means there will be a higher chance of one speaker being diarized as two different speakers but also a lower chance of two different speakers being diarized as one speaker (more total speakers predicted). Can only be set when diarize=True and num_speakers=None. Defaults to None, in which case we will choose a threshold based on the model_id (0.22 usually)."
              },
              "additional_formats": {
                "items": {
                  "oneOf": [
                    {
                      "properties": {
                        "include_speakers": {
                          "type": "boolean",
                          "title": "Include Speakers",
                          "default": true
                        },
                        "include_timestamps": {
                          "type": "boolean",
                          "title": "Include Timestamps",
                          "default": true
                        },
                        "format": {
                          "type": "string",
                          "title": "Format",
                          "enum": [
                            "segmented_json"
                          ]
                        },
                        "segment_on_silence_longer_than_s": {
                          "anyOf": [
                            {
                              "type": "number"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Segment On Silence Longer Than S"
                        },
                        "max_segment_duration_s": {
                          "anyOf": [
                            {
                              "type": "number"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Max Segment Duration S"
                        },
                        "max_segment_chars": {
                          "anyOf": [
                            {
                              "type": "integer"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Max Segment Chars"
                        }
                      },
                      "type": "object",
                      "required": [
                        "format"
                      ],
                      "title": "SegmentedJsonExportOptions"
                    },
                    {
                      "properties": {
                        "include_speakers": {
                          "type": "boolean",
                          "title": "Include Speakers",
                          "default": true
                        },
                        "include_timestamps": {
                          "type": "boolean",
                          "title": "Include Timestamps",
                          "default": true
                        },
                        "format": {
                          "type": "string",
                          "title": "Format",
                          "enum": [
                            "docx"
                          ]
                        },
                        "segment_on_silence_longer_than_s": {
                          "anyOf": [
                            {
                              "type": "number"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Segment On Silence Longer Than S"
                        },
                        "max_segment_duration_s": {
                          "anyOf": [
                            {
                              "type": "number"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Max Segment Duration S"
                        },
                        "max_segment_chars": {
                          "anyOf": [
                            {
                              "type": "integer"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Max Segment Chars"
                        }
                      },
                      "type": "object",
                      "required": [
                        "format"
                      ],
                      "title": "DocxExportOptions"
                    },
                    {
                      "properties": {
                        "include_speakers": {
                          "type": "boolean",
                          "title": "Include Speakers",
                          "default": true
                        },
                        "include_timestamps": {
                          "type": "boolean",
                          "title": "Include Timestamps",
                          "default": true
                        },
                        "format": {
                          "type": "string",
                          "title": "Format",
                          "enum": [
                            "pdf"
                          ]
                        },
                        "segment_on_silence_longer_than_s": {
                          "anyOf": [
                            {
                              "type": "number"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Segment On Silence Longer Than S"
                        },
                        "max_segment_duration_s": {
                          "anyOf": [
                            {
                              "type": "number"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Max Segment Duration S"
                        },
                        "max_segment_chars": {
                          "anyOf": [
                            {
                              "type": "integer"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Max Segment Chars"
                        }
                      },
                      "type": "object",
                      "required": [
                        "format"
                      ],
                      "title": "PdfExportOptions"
                    },
                    {
                      "properties": {
                        "max_characters_per_line": {
                          "anyOf": [
                            {
                              "type": "integer"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Max Characters Per Line",
                          "default": 100
                        },
                        "include_speakers": {
                          "type": "boolean",
                          "title": "Include Speakers",
                          "default": true
                        },
                        "include_timestamps": {
                          "type": "boolean",
                          "title": "Include Timestamps",
                          "default": true
                        },
                        "format": {
                          "type": "string",
                          "title": "Format",
                          "enum": [
                            "txt"
                          ]
                        },
                        "segment_on_silence_longer_than_s": {
                          "anyOf": [
                            {
                              "type": "number"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Segment On Silence Longer Than S"
                        },
                        "max_segment_duration_s": {
                          "anyOf": [
                            {
                              "type": "number"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Max Segment Duration S"
                        },
                        "max_segment_chars": {
                          "anyOf": [
                            {
                              "type": "integer"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Max Segment Chars"
                        }
                      },
                      "type": "object",
                      "required": [
                        "format"
                      ],
                      "title": "TxtExportOptions"
                    },
                    {
                      "properties": {
                        "include_speakers": {
                          "type": "boolean",
                          "title": "Include Speakers",
                          "default": true
                        },
                        "include_timestamps": {
                          "type": "boolean",
                          "title": "Include Timestamps",
                          "default": true
                        },
                        "format": {
                          "type": "string",
                          "title": "Format",
                          "enum": [
                            "html"
                          ]
                        },
                        "segment_on_silence_longer_than_s": {
                          "anyOf": [
                            {
                              "type": "number"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Segment On Silence Longer Than S"
                        },
                        "max_segment_duration_s": {
                          "anyOf": [
                            {
                              "type": "number"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Max Segment Duration S"
                        },
                        "max_segment_chars": {
                          "anyOf": [
                            {
                              "type": "integer"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Max Segment Chars"
                        }
                      },
                      "type": "object",
                      "required": [
                        "format"
                      ],
                      "title": "HtmlExportOptions"
                    },
                    {
                      "properties": {
                        "max_characters_per_line": {
                          "anyOf": [
                            {
                              "type": "integer"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Max Characters Per Line",
                          "default": 42
                        },
                        "include_speakers": {
                          "type": "boolean",
                          "title": "Include Speakers",
                          "default": false
                        },
                        "include_timestamps": {
                          "type": "boolean",
                          "title": "Include Timestamps",
                          "default": true
                        },
                        "format": {
                          "type": "string",
                          "title": "Format",
                          "enum": [
                            "srt"
                          ]
                        },
                        "segment_on_silence_longer_than_s": {
                          "anyOf": [
                            {
                              "type": "number"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Segment On Silence Longer Than S",
                          "default": 0.8
                        },
                        "max_segment_duration_s": {
                          "anyOf": [
                            {
                              "type": "number"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Max Segment Duration S",
                          "default": 4
                        },
                        "max_segment_chars": {
                          "anyOf": [
                            {
                              "type": "integer"
                            },
                            {
                              "type": "string",
                              "nullable": true
                            }
                          ],
                          "title": "Max Segment Chars",
                          "default": 84
                        }
                      },
                      "type": "object",
                      "required": [
                        "format"
                      ],
                      "title": "SrtExportOptions"
                    }
                  ],
                  "title": "ExportOptions",
                  "discriminator": {
                    "propertyName": "format",
                    "mapping": {
                      "docx": "#/components/schemas/DocxExportOptions",
                      "html": "#/components/schemas/HtmlExportOptions",
                      "pdf": "#/components/schemas/PdfExportOptions",
                      "segmented_json": "#/components/schemas/SegmentedJsonExportOptions",
                      "srt": "#/components/schemas/SrtExportOptions",
                      "txt": "#/components/schemas/TxtExportOptions"
                    }
                  }
                },
                "type": "array",
                "maxItems": 10,
                "title": "AdditionalFormats"
              },
              "webhook_id": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "string",
                    "nullable": true
                  }
                ],
                "title": "Webhook Id",
                "description": "Optional specific webhook ID to send the transcription result to. Only valid when webhook is set to true. If not provided, transcription will be sent to all configured speech-to-text webhooks."
              },
              "temperature": {
                "anyOf": [
                  {
                    "type": "number",
                    "maximum": 2,
                    "minimum": 0
                  },
                  {
                    "type": "string",
                    "nullable": true
                  }
                ],
                "title": "Temperature",
                "description": "Controls the randomness of the transcription output. Accepts values between 0.0 and 2.0, where higher values result in more diverse and less deterministic results. If omitted, we will use a temperature based on the model you selected which is usually 0."
              },
              "seed": {
                "anyOf": [
                  {
                    "type": "integer",
                    "maximum": 2147483647,
                    "minimum": 0
                  },
                  {
                    "type": "string",
                    "nullable": true
                  }
                ],
                "title": "Seed",
                "description": "If specified, our system will make a best effort to sample deterministically, such that repeated requests with the same seed and parameters should return the same result. Determinism is not guaranteed. Must be an integer between 0 and 2147483647."
              },
              "webhook_metadata": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "type": "object"
                  },
                  {
                    "type": "string",
                    "nullable": true
                  }
                ],
                "title": "Webhook Metadata",
                "description": "Optional metadata to be included in the webhook response. This should be a JSON string representing an object with a maximum depth of 2 levels and maximum size of 16KB. Useful for tracking internal IDs, job references, or other contextual information."
              },
              "entity_detection": {
                "anyOf": [
                  {
                    "type": "string"
                  },
                  {
                    "items": {
                      "type": "string"
                    },
                    "type": "array"
                  },
                  {
                    "type": "string",
                    "nullable": true
                  }
                ],
                "title": "Entity Detection",
                "description": "Detect entities in the transcript. Can be 'all' to detect all entities, a single entity type or category string, or a list of entity types/categories. Categories include 'pii', 'phi', 'pci', 'other', 'offensive_language'. When enabled, detected entities will be returned in the 'entities' field with their text, type, and character positions."
              },
              "keyterms": {
                "items": {
                  "type": "string"
                },
                "type": "array",
                "title": "Keyterms",
                "description": "A list of keyterms to bias the transcription towards.           The keyterms are words or phrases you want the model to recognise more accurately.           The number of keyterms cannot exceed 100.           The length of each keyterm must be less than 50 characters.           Keyterms can contain at most 5 words (after normalisation).           For example [\"hello\", \"world\", \"technical term\"]",
                "default": []
              }
            },
            "type": "object",
            "required": [
              "model_id"
            ],
            "title": "Eleven Labs batch transcription service",
            "readOnly": true,
            "nullable": true,
            "description": "Docs: https://elevenlabs.io/docs/api-reference/speech-to-text"
          },
          "assembly_ai_async_chunked": {
            "properties": {
              "language_code": {
                "x-label": "Language code",
                "description": "The language of your audio file. Possible values are found in [Supported Languages](https://www.assemblyai.com/docs/concepts/supported-languages).\nThe default value is 'en_us'.\n",
                "oneOf": [
                  {
                    "anyOf": [
                      {
                        "x-label": "Language code",
                        "type": "string",
                        "description": "The language of your audio file. Possible values are found in [Supported Languages](https://www.assemblyai.com/docs/concepts/supported-languages).\nThe default value is 'en_us'.\n",
                        "x-fern-sdk-group-name": "transcripts",
                        "enum": [
                          "en",
                          "en_au",
                          "en_uk",
                          "en_us",
                          "es",
                          "fr",
                          "de",
                          "it",
                          "pt",
                          "nl",
                          "af",
                          "sq",
                          "am",
                          "ar",
                          "hy",
                          "as",
                          "az",
                          "ba",
                          "eu",
                          "be",
                          "bn",
                          "bs",
                          "br",
                          "bg",
                          "my",
                          "ca",
                          "zh",
                          "hr",
                          "cs",
                          "da",
                          "et",
                          "fo",
                          "fi",
                          "gl",
                          "ka",
                          "el",
                          "gu",
                          "ht",
                          "ha",
                          "haw",
                          "he",
                          "hi",
                          "hu",
                          "is",
                          "id",
                          "ja",
                          "jw",
                          "kn",
                          "kk",
                          "km",
                          "ko",
                          "lo",
                          "la",
                          "lv",
                          "ln",
                          "lt",
                          "lb",
                          "mk",
                          "mg",
                          "ms",
                          "ml",
                          "mt",
                          "mi",
                          "mr",
                          "mn",
                          "ne",
                          "no",
                          "nn",
                          "oc",
                          "pa",
                          "ps",
                          "fa",
                          "pl",
                          "ro",
                          "ru",
                          "sa",
                          "sr",
                          "sn",
                          "sd",
                          "si",
                          "sk",
                          "sl",
                          "so",
                          "su",
                          "sw",
                          "sv",
                          "tl",
                          "tg",
                          "ta",
                          "tt",
                          "te",
                          "th",
                          "bo",
                          "tr",
                          "tk",
                          "uk",
                          "ur",
                          "uz",
                          "vi",
                          "cy",
                          "yi",
                          "yo"
                        ],
                        "x-aai-enum": {
                          "en": {
                            "label": "English (global)"
                          },
                          "en_au": {
                            "label": "English (Australian)"
                          },
                          "en_uk": {
                            "label": "English (British)"
                          },
                          "en_us": {
                            "label": "English (US)"
                          },
                          "es": {
                            "label": "Spanish"
                          },
                          "fr": {
                            "label": "French"
                          },
                          "de": {
                            "label": "German"
                          },
                          "it": {
                            "label": "Italian"
                          },
                          "pt": {
                            "label": "Portuguese"
                          },
                          "nl": {
                            "label": "Dutch"
                          },
                          "af": {
                            "label": "Afrikaans"
                          },
                          "sq": {
                            "label": "Albanian"
                          },
                          "am": {
                            "label": "Amharic"
                          },
                          "ar": {
                            "label": "Arabic"
                          },
                          "hy": {
                            "label": "Armenian"
                          },
                          "as": {
                            "label": "Assamese"
                          },
                          "az": {
                            "label": "Azerbaijani"
                          },
                          "ba": {
                            "label": "Bashkir"
                          },
                          "eu": {
                            "label": "Basque"
                          },
                          "be": {
                            "label": "Belarusian"
                          },
                          "bn": {
                            "label": "Bengali"
                          },
                          "bs": {
                            "label": "Bosnian"
                          },
                          "br": {
                            "label": "Breton"
                          },
                          "bg": {
                            "label": "Bulgarian"
                          },
                          "my": {
                            "label": "Burmese"
                          },
                          "ca": {
                            "label": "Catalan"
                          },
                          "zh": {
                            "label": "Chinese"
                          },
                          "hr": {
                            "label": "Croatian"
                          },
                          "cs": {
                            "label": "Czech"
                          },
                          "da": {
                            "label": "Danish"
                          },
                          "et": {
                            "label": "Estonian"
                          },
                          "fo": {
                            "label": "Faroese"
                          },
                          "fi": {
                            "label": "Finnish"
                          },
                          "gl": {
                            "label": "Galician"
                          },
                          "ka": {
                            "label": "Georgian"
                          },
                          "el": {
                            "label": "Greek"
                          },
                          "gu": {
                            "label": "Gujarati"
                          },
                          "ht": {
                            "label": "Haitian"
                          },
                          "ha": {
                            "label": "Hausa"
                          },
                          "haw": {
                            "label": "Hawaiian"
                          },
                          "he": {
                            "label": "Hebrew"
                          },
                          "hi": {
                            "label": "Hindi"
                          },
                          "hu": {
                            "label": "Hungarian"
                          },
                          "is": {
                            "label": "Icelandic"
                          },
                          "id": {
                            "label": "Indonesian"
                          },
                          "ja": {
                            "label": "Japanese"
                          },
                          "jw": {
                            "label": "Javanese"
                          },
                          "kn": {
                            "label": "Kannada"
                          },
                          "kk": {
                            "label": "Kazakh"
                          },
                          "km": {
                            "label": "Khmer"
                          },
                          "ko": {
                            "label": "Korean"
                          },
                          "lo": {
                            "label": "Lao"
                          },
                          "la": {
                            "label": "Latin"
                          },
                          "lv": {
                            "label": "Latvian"
                          },
                          "ln": {
                            "label": "Lingala"
                          },
                          "lt": {
                            "label": "Lithuanian"
                          },
                          "lb": {
                            "label": "Luxembourgish"
                          },
                          "mk": {
                            "label": "Macedonian"
                          },
                          "mg": {
                            "label": "Malagasy"
                          },
                          "ms": {
                            "label": "Malay"
                          },
                          "ml": {
                            "label": "Malayalam"
                          },
                          "mt": {
                            "label": "Maltese"
                          },
                          "mi": {
                            "label": "Maori"
                          },
                          "mr": {
                            "label": "Marathi"
                          },
                          "mn": {
                            "label": "Mongolian"
                          },
                          "ne": {
                            "label": "Nepali"
                          },
                          "no": {
                            "label": "Norwegian"
                          },
                          "nn": {
                            "label": "Norwegian Nynorsk"
                          },
                          "oc": {
                            "label": "Occitan"
                          },
                          "pa": {
                            "label": "Panjabi"
                          },
                          "ps": {
                            "label": "Pashto"
                          },
                          "fa": {
                            "label": "Persian"
                          },
                          "pl": {
                            "label": "Polish"
                          },
                          "ro": {
                            "label": "Romanian"
                          },
                          "ru": {
                            "label": "Russian"
                          },
                          "sa": {
                            "label": "Sanskrit"
                          },
                          "sr": {
                            "label": "Serbian"
                          },
                          "sn": {
                            "label": "Shona"
                          },
                          "sd": {
                            "label": "Sindhi"
                          },
                          "si": {
                            "label": "Sinhala"
                          },
                          "sk": {
                            "label": "Slovak"
                          },
                          "sl": {
                            "label": "Slovenian"
                          },
                          "so": {
                            "label": "Somali"
                          },
                          "su": {
                            "label": "Sundanese"
                          },
                          "sw": {
                            "label": "Swahili"
                          },
                          "sv": {
                            "label": "Swedish"
                          },
                          "tl": {
                            "label": "Tagalog"
                          },
                          "tg": {
                            "label": "Tajik"
                          },
                          "ta": {
                            "label": "Tamil"
                          },
                          "tt": {
                            "label": "Tatar"
                          },
                          "te": {
                            "label": "Telugu"
                          },
                          "th": {
                            "label": "Thai"
                          },
                          "bo": {
                            "label": "Tibetan"
                          },
                          "tr": {
                            "label": "Turkish"
                          },
                          "tk": {
                            "label": "Turkmen"
                          },
                          "uk": {
                            "label": "Ukrainian"
                          },
                          "ur": {
                            "label": "Urdu"
                          },
                          "uz": {
                            "label": "Uzbek"
                          },
                          "vi": {
                            "label": "Vietnamese"
                          },
                          "cy": {
                            "label": "Welsh"
                          },
                          "yi": {
                            "label": "Yiddish"
                          },
                          "yo": {
                            "label": "Yoruba"
                          }
                        }
                      },
                      {
                        "type": "string"
                      }
                    ]
                  },
                  {
                    "type": "string",
                    "nullable": true
                  }
                ],
                "default": "en_us",
                "x-ts-type": "LiteralUnion<TranscriptLanguageCode, string> | null",
                "x-go-type": "TranscriptLanguageCode"
              },
              "language_detection": {
                "x-label": "Language detection",
                "description": "Enable [Automatic language detection](https://www.assemblyai.com/docs/models/speech-recognition#automatic-language-detection), either true or false.",
                "type": "boolean",
                "default": false
              },
              "language_confidence_threshold": {
                "x-label": "Language confidence threshold",
                "description": "The confidence threshold for the automatically detected language.\nAn error will be returned if the language confidence is below this threshold.\nDefaults to 0.\n",
                "type": "number",
                "format": "float",
                "minimum": 0,
                "maximum": 1,
                "default": 0
              },
              "speech_model": {
                "x-label": "Speech model",
                "description": "The speech model to use for the transcription. When `null`, the \"best\" model is used.",
                "default": "best",
                "oneOf": [
                  {
                    "x-label": "Speech model",
                    "type": "string",
                    "description": "The speech model to use for the transcription.",
                    "x-fern-sdk-group-name": "transcripts",
                    "enum": [
                      "best",
                      "slam-1",
                      "universal"
                    ],
                    "x-fern-enum": {
                      "universal": {
                        "name": "Universal",
                        "description": "The model optimized for accuracy, low latency, ease of use, and mutli-language support."
                      },
                      "slam-1": {
                        "name": "Slam-1",
                        "description": "A contextual model optimized for customization."
                      },
                      "best": {
                        "name": "Best",
                        "description": "The model optimized for accuracy, low latency, ease of use, and mutli-language support."
                      }
                    },
                    "x-aai-enum": {
                      "best": {
                        "label": "Best"
                      },
                      "nano": {
                        "label": "Nano"
                      }
                    }
                  },
                  {
                    "type": "string",
                    "nullable": true
                  }
                ]
              },
              "punctuate": {
                "x-label": "Punctuate",
                "description": "Enable Automatic Punctuation, can be true or false",
                "type": "boolean",
                "default": true
              },
              "format_text": {
                "x-label": "Format text",
                "description": "Enable Text Formatting, can be true or false",
                "type": "boolean",
                "default": true
              },
              "disfluencies": {
                "x-label": "Disfluencies",
                "description": "Transcribe Filler Words, like \"umm\", in your media file; can be true or false",
                "type": "boolean",
                "default": false
              },
              "multichannel": {
                "x-label": "Multichannel",
                "description": "Enable [Multichannel](https://www.assemblyai.com/docs/models/speech-recognition#multichannel-transcription) transcription, can be true or false.",
                "type": "boolean",
                "default": false
              },
              "dual_channel": {
                "x-label": "Dual channel",
                "description": "Enable [Dual Channel](https://www.assemblyai.com/docs/models/speech-recognition#dual-channel-transcription) transcription, can be true or false.",
                "type": "boolean",
                "default": false,
                "deprecated": true
              },
              "auto_highlights": {
                "x-label": "Key phrases",
                "description": "Enable Key Phrases, either true or false",
                "type": "boolean",
                "default": false
              },
              "audio_start_from": {
                "x-label": "Audio start from",
                "description": "The point in time, in milliseconds, to begin transcribing in your media file",
                "type": "integer"
              },
              "audio_end_at": {
                "x-label": "Audio end at",
                "description": "The point in time, in milliseconds, to stop transcribing in your media file",
                "type": "integer"
              },
              "word_boost": {
                "x-label": "Word boost",
                "description": "The list of custom vocabulary to boost transcription probability for",
                "type": "array",
                "items": {
                  "x-label": "Word to boost",
                  "type": "string"
                },
                "deprecated": true
              },
              "boost_param": {
                "type": "string",
                "x-label": "Word boost level",
                "description": "How much to boost specified words",
                "x-fern-sdk-group-name": "transcripts",
                "enum": [
                  "low",
                  "default",
                  "high"
                ],
                "x-aai-enum": {
                  "low": {
                    "label": "Low"
                  },
                  "default": {
                    "label": "Default"
                  },
                  "high": {
                    "label": "High"
                  }
                }
              },
              "filter_profanity": {
                "x-label": "Filter profanity",
                "description": "Filter profanity from the transcribed text, can be true or false",
                "type": "boolean",
                "default": false
              },
              "redact_pii": {
                "x-label": "Redact PII",
                "description": "Redact PII from the transcribed text using the Redact PII model, can be true or false",
                "type": "boolean",
                "default": false
              },
              "redact_pii_audio": {
                "x-label": "Redact PII audio",
                "description": "Generate a copy of the original media file with spoken PII \"beeped\" out, can be true or false. See [PII redaction](https://www.assemblyai.com/docs/models/pii-redaction) for more details.",
                "type": "boolean",
                "default": false
              },
              "redact_pii_audio_quality": {
                "x-label": "Redact PII audio quality",
                "type": "string",
                "description": "Controls the filetype of the audio created by redact_pii_audio. Currently supports mp3 (default) and wav. See [PII redaction](https://www.assemblyai.com/docs/models/pii-redaction) for more details.",
                "x-fern-sdk-group-name": "transcripts",
                "enum": [
                  "mp3",
                  "wav"
                ],
                "x-fern-enum": {
                  "mp3": {
                    "description": "MP3 audio format is lower quality and lower size than WAV.",
                    "casing": {
                      "camel": "mp3",
                      "snake": "mp3",
                      "pascal": "Mp3",
                      "screamingSnake": "MP3"
                    }
                  },
                  "wav": {
                    "description": "WAV audio format is the highest quality (no compression) and larger size than MP3."
                  }
                },
                "x-aai-enum": {
                  "mp3": {
                    "label": "MP3"
                  },
                  "wav": {
                    "label": "WAV"
                  }
                },
                "example": "mp3"
              },
              "redact_pii_policies": {
                "x-label": "Redact PII policies",
                "description": "The list of PII Redaction policies to enable. See [PII redaction](https://www.assemblyai.com/docs/models/pii-redaction) for more details.",
                "type": "array",
                "items": {
                  "x-label": "PII policy",
                  "description": "The type of PII to redact",
                  "x-fern-sdk-group-name": "transcripts",
                  "type": "string",
                  "enum": [
                    "account_number",
                    "banking_information",
                    "blood_type",
                    "credit_card_cvv",
                    "credit_card_expiration",
                    "credit_card_number",
                    "date",
                    "date_interval",
                    "date_of_birth",
                    "drivers_license",
                    "drug",
                    "duration",
                    "email_address",
                    "event",
                    "filename",
                    "gender_sexuality",
                    "healthcare_number",
                    "injury",
                    "ip_address",
                    "language",
                    "location",
                    "marital_status",
                    "medical_condition",
                    "medical_process",
                    "money_amount",
                    "nationality",
                    "number_sequence",
                    "occupation",
                    "organization",
                    "passport_number",
                    "password",
                    "person_age",
                    "person_name",
                    "phone_number",
                    "physical_attribute",
                    "political_affiliation",
                    "religion",
                    "statistics",
                    "time",
                    "url",
                    "us_social_security_number",
                    "username",
                    "vehicle_id",
                    "zodiac_sign"
                  ],
                  "x-fern-enum": {
                    "account_number": {
                      "description": "Customer account or membership identification number (e.g., Policy No. 10042992, Member ID: HZ-5235-001)"
                    },
                    "banking_information": {
                      "description": "Banking information, including account and routing numbers"
                    },
                    "blood_type": {
                      "description": "Blood type (e.g., O-, AB positive)"
                    },
                    "credit_card_cvv": {
                      "description": "Credit card verification code (e.g., CVV: 080)"
                    },
                    "credit_card_expiration": {
                      "description": "Expiration date of a credit card"
                    },
                    "credit_card_number": {
                      "description": "Credit card number"
                    },
                    "date": {
                      "description": "Specific calendar date (e.g., December 18)"
                    },
                    "date_interval": {
                      "description": "Broader time periods, including date ranges, months, seasons, years, and decades (e.g., 2020-2021, 5-9 May, January 1984)"
                    },
                    "date_of_birth": {
                      "description": "Date of birth (e.g., Date of Birth: March 7,1961)"
                    },
                    "drivers_license": {
                      "description": "Driver's license number. (e.g., DL# 356933-540)"
                    },
                    "drug": {
                      "description": "Medications, vitamins, or supplements (e.g., Advil, Acetaminophen, Panadol)"
                    },
                    "duration": {
                      "description": "Periods of time, specified as a number and a unit of time (e.g., 8 months, 2 years)"
                    },
                    "email_address": {
                      "description": "Email address (e.g., support@assemblyai.com)"
                    },
                    "event": {
                      "description": "Name of an event or holiday (e.g., Olympics, Yom Kippur)"
                    },
                    "filename": {
                      "description": "Names of computer files, including the extension or filepath (e.g., Taxes/2012/brad-tax-returns.pdf)"
                    },
                    "gender_sexuality": {
                      "description": "Terms indicating gender identity or sexual orientation, including slang terms (e.g., female, bisexual, trans)"
                    },
                    "healthcare_number": {
                      "description": "Healthcare numbers and health plan beneficiary numbers (e.g., Policy No.: 5584-486-674-YM)"
                    },
                    "injury": {
                      "description": "Bodily injury (e.g., I broke my arm, I have a sprained wrist)"
                    },
                    "ip_address": {
                      "description": "Internet IP address, including IPv4 and IPv6 formats (e.g., 192.168.0.1)"
                    },
                    "language": {
                      "description": "Name of a natural language (e.g., Spanish, French)"
                    },
                    "location": {
                      "description": "Any Location reference including mailing address, postal code, city, state, province, country, or coordinates. (e.g., Lake Victoria, 145 Windsor St., 90210)"
                    },
                    "marital_status": {
                      "description": "Terms indicating marital status (e.g., Single, common-law, ex-wife, married)"
                    },
                    "medical_condition": {
                      "description": "Name of a medical condition, disease, syndrome, deficit, or disorder (e.g., chronic fatigue syndrome, arrhythmia, depression)"
                    },
                    "medical_process": {
                      "description": "Medical process, including treatments, procedures, and tests (e.g., heart surgery, CT scan)"
                    },
                    "money_amount": {
                      "description": "Name and/or amount of currency (e.g., 15 pesos, $94.50)"
                    },
                    "nationality": {
                      "description": "Terms indicating nationality, ethnicity, or race (e.g., American, Asian, Caucasian)"
                    },
                    "number_sequence": {
                      "description": "Numerical PII (including alphanumeric strings) that doesn't fall under other categories"
                    },
                    "occupation": {
                      "description": "Job title or profession (e.g., professor, actors, engineer, CPA)"
                    },
                    "organization": {
                      "description": "Name of an organization (e.g., CNN, McDonalds, University of Alaska, Northwest General Hospital)"
                    },
                    "passport_number": {
                      "description": "Passport numbers, issued by any country (e.g., PA4568332, NU3C6L86S12)"
                    },
                    "password": {
                      "description": "Account passwords, PINs, access keys, or verification answers (e.g., 27%alfalfa, temp1234, My mother's maiden name is Smith)"
                    },
                    "person_age": {
                      "description": "Number associated with an age (e.g., 27, 75)"
                    },
                    "person_name": {
                      "description": "Name of a person (e.g., Bob, Doug Jones, Dr. Kay Martinez, MD)"
                    },
                    "phone_number": {
                      "description": "Telephone or fax number"
                    },
                    "physical_attribute": {
                      "description": "Distinctive bodily attributes, including terms indicating race (e.g., I'm 190cm tall, He belongs to the Black students' association)"
                    },
                    "political_affiliation": {
                      "description": "Terms referring to a political party, movement, or ideology (e.g., Republican, Liberal)"
                    },
                    "religion": {
                      "description": "Terms indicating religious affiliation (e.g., Hindu, Catholic)"
                    },
                    "statistics": {
                      "description": "Medical statistics (e.g., 18%, 18 percent)"
                    },
                    "time": {
                      "description": "Expressions indicating clock times (e.g., 19:37:28, 10pm EST)"
                    },
                    "url": {
                      "description": "Internet addresses (e.g., https://www.assemblyai.com/)"
                    },
                    "us_social_security_number": {
                      "description": "Social Security Number or equivalent"
                    },
                    "username": {
                      "description": "Usernames, login names, or handles (e.g., @AssemblyAI)"
                    },
                    "vehicle_id": {
                      "description": "Vehicle identification numbers (VINs), vehicle serial numbers, and license plate numbers (e.g., 5FNRL38918B111818, BIF7547)"
                    },
                    "zodiac_sign": {
                      "description": "Names of Zodiac signs (e.g., Aries, Taurus)"
                    }
                  },
                  "x-aai-enum": {
                    "account_number": {
                      "label": "Account number"
                    },
                    "banking_information": {
                      "label": "Banking information"
                    },
                    "blood_type": {
                      "label": "Blood type"
                    },
                    "credit_card_cvv": {
                      "label": "Credit card CVV"
                    },
                    "credit_card_expiration": {
                      "label": "Credit card expiration"
                    },
                    "credit_card_number": {
                      "label": "Credit card number"
                    },
                    "date": {
                      "label": "Date"
                    },
                    "date_interval": {
                      "label": "Date interval"
                    },
                    "date_of_birth": {
                      "label": "Date of birth"
                    },
                    "drivers_license": {
                      "label": "Driver's license"
                    },
                    "drug": {
                      "label": "Drug"
                    },
                    "duration": {
                      "label": "Duration"
                    },
                    "email_address": {
                      "label": "Email address"
                    },
                    "event": {
                      "label": "Event"
                    },
                    "filename": {
                      "label": "Filename"
                    },
                    "gender_sexuality": {
                      "label": "Gender sexuality"
                    },
                    "healthcare_number": {
                      "label": "Healthcare number"
                    },
                    "injury": {
                      "label": "Injury"
                    },
                    "ip_address": {
                      "label": "IP address"
                    },
                    "language": {
                      "label": "Language"
                    },
                    "location": {
                      "label": "Location"
                    },
                    "marital_status": {
                      "label": "Marital status"
                    },
                    "medical_condition": {
                      "label": "Medical condition"
                    },
                    "medical_process": {
                      "label": "Medical process"
                    },
                    "money_amount": {
                      "label": "Money amount"
                    },
                    "nationality": {
                      "label": "Nationality"
                    },
                    "number_sequence": {
                      "label": "Number sequence"
                    },
                    "occupation": {
                      "label": "Occupation"
                    },
                    "organization": {
                      "label": "Organization"
                    },
                    "passport_number": {
                      "label": "Passport number"
                    },
                    "password": {
                      "label": "Password"
                    },
                    "person_age": {
                      "label": "Person age"
                    },
                    "person_name": {
                      "label": "Person name"
                    },
                    "phone_number": {
                      "label": "Phone number"
                    },
                    "physical_attribute": {
                      "label": "Physical attribute"
                    },
                    "political_affiliation": {
                      "label": "Political affiliation"
                    },
                    "religion": {
                      "label": "Religion"
                    },
                    "statistics": {
                      "label": "Statistics"
                    },
                    "time": {
                      "label": "Time"
                    },
                    "url": {
                      "label": "URL"
                    },
                    "us_social_security_number": {
                      "label": "US Social Security Number"
                    },
                    "username": {
                      "label": "Username"
                    },
                    "vehicle_id": {
                      "label": "Vehicle ID"
                    },
                    "zodiac_sign": {
                      "label": "Zodiac sign"
                    }
                  }
                }
              },
              "redact_pii_sub": {
                "x-label": "Redact PII substitution",
                "description": "The replacement logic for detected PII, can be \"entity_type\" or \"hash\". See [PII redaction](https://www.assemblyai.com/docs/models/pii-redaction) for more details.",
                "oneOf": [
                  {
                    "x-label": "Redact PII substitution",
                    "type": "string",
                    "x-fern-sdk-group-name": "transcripts",
                    "description": "The replacement logic for detected PII, can be \"entity_name\" or \"hash\". See [PII redaction](https://www.assemblyai.com/docs/models/pii-redaction) for more details.",
                    "enum": [
                      "entity_name",
                      "hash"
                    ],
                    "x-aai-enum": {
                      "entity_name": {
                        "label": "Entity name"
                      },
                      "hash": {
                        "label": "Hash"
                      }
                    }
                  },
                  {
                    "type": "string",
                    "nullable": true
                  }
                ],
                "default": "hash"
              },
              "speaker_labels": {
                "x-label": "Speaker labels",
                "description": "Enable [Speaker diarization](https://www.assemblyai.com/docs/models/speaker-diarization), can be true or false",
                "type": "boolean",
                "default": false
              },
              "speakers_expected": {
                "x-label": "Speakers expected",
                "description": "Tells the speaker label model how many speakers it should attempt to identify. See [Speaker diarization](https://www.assemblyai.com/docs/models/speaker-diarization) for more details.",
                "type": "integer",
                "default": null,
                "nullable": true
              },
              "content_safety": {
                "x-label": "Content Moderation",
                "description": "Enable [Content Moderation](https://www.assemblyai.com/docs/models/content-moderation), can be true or false",
                "type": "boolean",
                "default": false
              },
              "content_safety_confidence": {
                "x-label": "Content Moderation confidence",
                "description": "The confidence threshold for the Content Moderation model. Values must be between 25 and 100.",
                "type": "integer",
                "default": 50,
                "minimum": 25,
                "maximum": 100
              },
              "iab_categories": {
                "x-label": "Topic Detection",
                "description": "Enable [Topic Detection](https://www.assemblyai.com/docs/models/topic-detection), can be true or false",
                "type": "boolean",
                "default": false
              },
              "custom_spelling": {
                "x-label": "Custom spellings",
                "description": "Customize how words are spelled and formatted using to and from values",
                "type": "array",
                "items": {
                  "x-label": "Custom spelling",
                  "description": "Object containing words or phrases to replace, and the word or phrase to replace with",
                  "x-fern-sdk-group-name": "transcripts",
                  "type": "object",
                  "additionalProperties": false,
                  "properties": {
                    "from": {
                      "x-label": "From",
                      "description": "Words or phrases to replace",
                      "type": "array",
                      "items": {
                        "x-label": "Word or phrase",
                        "description": "Word or phrase to replace",
                        "type": "string"
                      }
                    },
                    "to": {
                      "x-label": "To",
                      "description": "Word to replace with",
                      "type": "string"
                    }
                  },
                  "required": [
                    "from",
                    "to"
                  ],
                  "example": {
                    "from": [
                      "dicarlo"
                    ],
                    "to": "Decarlo"
                  }
                }
              },
              "keyterms_prompt": {
                "x-label": "Keyterms prompt",
                "description": "<Warning>`keyterms_prompt` is only supported when the `speech_model` is specified as `slam-1`</Warning>\nImprove accuracy with up to 1000 domain-specific words or phrases (maximum 6 words per phrase).\n",
                "type": "array",
                "items": {
                  "x-label": "Keyterm",
                  "type": "string"
                }
              },
              "prompt": {
                "x-label": "Prompt",
                "description": "This parameter does not currently have any functionality attached to it.",
                "type": "string",
                "deprecated": true
              },
              "sentiment_analysis": {
                "x-label": "Sentiment Analysis",
                "description": "Enable [Sentiment Analysis](https://www.assemblyai.com/docs/models/sentiment-analysis), can be true or false",
                "type": "boolean",
                "default": false
              },
              "auto_chapters": {
                "x-label": "Auto chapters",
                "description": "Enable [Auto Chapters](https://www.assemblyai.com/docs/models/auto-chapters), can be true or false",
                "type": "boolean",
                "default": false
              },
              "entity_detection": {
                "x-label": "Entity Detection",
                "description": "Enable [Entity Detection](https://www.assemblyai.com/docs/models/entity-detection), can be true or false",
                "type": "boolean",
                "default": false
              },
              "speech_threshold": {
                "x-label": "Speech threshold",
                "description": "Reject audio files that contain less than this fraction of speech.\nValid values are in the range [0, 1] inclusive.\n",
                "type": "number",
                "format": "float",
                "minimum": 0,
                "maximum": 1,
                "default": 0,
                "nullable": true
              },
              "summarization": {
                "x-label": "Enable Summarization",
                "description": "Enable [Summarization](https://www.assemblyai.com/docs/models/summarization), can be true or false",
                "type": "boolean",
                "default": false
              },
              "summary_model": {
                "type": "string",
                "x-label": "Summary model",
                "description": "The model to summarize the transcript",
                "x-fern-sdk-group-name": "transcripts",
                "enum": [
                  "informative",
                  "conversational",
                  "catchy"
                ],
                "x-aai-enum": {
                  "informative": {
                    "label": "Informative"
                  },
                  "conversational": {
                    "label": "Conversational"
                  },
                  "catchy": {
                    "label": "Catchy"
                  }
                }
              },
              "summary_type": {
                "type": "string",
                "x-label": "Summary type",
                "description": "The type of summary",
                "x-fern-sdk-group-name": "transcripts",
                "enum": [
                  "bullets",
                  "bullets_verbose",
                  "gist",
                  "headline",
                  "paragraph"
                ],
                "x-aai-enum": {
                  "bullets": {
                    "label": "Bullets"
                  },
                  "bullets_verbose": {
                    "label": "Bullets verbose"
                  },
                  "gist": {
                    "label": "Gist"
                  },
                  "headline": {
                    "label": "Headline"
                  },
                  "paragraph": {
                    "label": "Paragraph"
                  }
                }
              },
              "custom_topics": {
                "x-label": "Enable custom topics",
                "description": "Enable custom topics, either true or false",
                "type": "boolean",
                "default": false,
                "deprecated": true
              },
              "topics": {
                "x-label": "Custom topics",
                "description": "The list of custom topics",
                "type": "array",
                "items": {
                  "x-label": "Topic",
                  "type": "string"
                }
              }
            },
            "type": "object",
            "additionalProperties": false,
            "x-label": "Optional transcript parameters",
            "description": "Docs: https://www.assemblyai.com/docs/api-reference/transcripts/submit",
            "x-fern-sdk-group-name": "transcripts",
            "example": {
              "speech_model": null,
              "language_code": "en_us",
              "language_detection": true,
              "language_confidence_threshold": 0.7,
              "punctuate": true,
              "format_text": true,
              "multichannel": true,
              "dual_channel": false,
              "webhook_url": "https://your-webhook-url.tld/path",
              "webhook_auth_header_name": "webhook-secret",
              "webhook_auth_header_value": "webhook-secret-value",
              "auto_highlights": true,
              "audio_start_from": 10,
              "audio_end_at": 280,
              "word_boost": [
                "aws",
                "azure",
                "google cloud"
              ],
              "boost_param": "high",
              "filter_profanity": true,
              "redact_pii": true,
              "redact_pii_audio": true,
              "redact_pii_audio_quality": "mp3",
              "redact_pii_policies": [
                "us_social_security_number",
                "credit_card_number"
              ],
              "redact_pii_sub": "hash",
              "speaker_labels": true,
              "speakers_expected": 2,
              "content_safety": true,
              "iab_categories": true,
              "custom_spelling": [],
              "disfluencies": false,
              "sentiment_analysis": true,
              "auto_chapters": true,
              "entity_detection": true,
              "speech_threshold": 0.5,
              "summarization": true,
              "summary_model": "informative",
              "summary_type": "bullets",
              "custom_topics": true,
              "topics": []
            },
            "title": "AssemblyAi async chunked transcription Settings"
          },
          "assembly_ai_v3_streaming": {
            "type": "object",
            "properties": {
              "end_of_turn_confidence_threshold": {
                "description": "The confidence threshold (0.0 to 1.0) to use when determining if the end of a turn has been reached",
                "default": "0.4"
              },
              "format_turns": {
                "description": "Whether to return formatted final transcripts",
                "default": false,
                "type": "boolean"
              },
              "inactivity_timeout": {
                "description": "Optional time in seconds of inactivity before session is terminated. If not set, no inactivity timeout is applied.",
                "default": "None",
                "format": "s"
              },
              "keyterms_prompt": {
                "description": "A list of words and phrases to improve recognition accuracy for.",
                "type": "array",
                "items": {
                  "x-label": "Word",
                  "type": "string"
                }
              },
              "language_detection": {
                "description": "Whether to detect the language of the audio stream",
                "enum": [
                  "true",
                  "false"
                ],
                "default": "false"
              },
              "min_end_of_turn_silence_when_confident": {
                "description": "The minimum amount of silence in milliseconds required to detect end of turn when confident",
                "default": "400",
                "format": "ms"
              },
              "max_turn_silence": {
                "description": "The maximum amount of silence in milliseconds allowed in a turn before end of turn is triggered",
                "default": "1280",
                "format": "ms"
              },
              "language": {
                "description": "The language of your audio stream.",
                "enum": [
                  "en",
                  "multi"
                ],
                "default": "en",
                "deprecated": true
              },
              "speech_model": {
                "description": "The speech model used for your Streaming session.",
                "enum": [
                  "universal-streaming-english",
                  "universal-streaming-multilingual"
                ],
                "default": "universal-streaming-english"
              }
            },
            "title": "AssemblyAi Real-time Transcription Settings",
            "description": "Docs: https://www.assemblyai.com/docs/api-reference/streaming-api/streaming-api"
          },
          "recallai_streaming": {
            "allOf": [
              {
                "$ref": "#/components/schemas/RecallaiStreamingTranscription"
              }
            ],
            "title": "Recall.ai Real-time Transcription Settings",
            "description": "Docs: https://docs.recall.ai/docs/recallai-transcription"
          },
          "deepgram_streaming": {
            "type": "object",
            "properties": {
              "diarize": {
                "description": "Defaults to `false`. Recognize speaker changes. Each word in the transcript will be assigned a speaker number starting at 0",
                "default": "false",
                "enum": [
                  "true",
                  "false"
                ]
              },
              "dictation": {
                "description": "Identify and extract key entities from content in submitted audio",
                "default": "false",
                "enum": [
                  "true",
                  "false"
                ]
              },
              "endpointing": {
                "description": "Indicates how long Deepgram will wait to detect whether a speaker has finished speaking or pauses for a significant period of time. When set to a value, the streaming endpoint immediately finalizes the transcription for the processed time range and returns the transcript with a speech_final parameter set to true. Can also be set to false to disable endpointing",
                "default": "10"
              },
              "extra": {
                "description": "Arbitrary key-value pairs that are attached to the API response for usage in downstream processing"
              },
              "filler_words": {
                "description": "Filler Words can help transcribe interruptions in your audio, like \"uh\" and \"um\"",
                "default": "false",
                "enum": [
                  "true",
                  "false"
                ]
              },
              "interim_results": {
                "description": "Specifies whether the streaming endpoint should provide ongoing transcription updates as more audio is received. When set to true, the endpoint sends continuous updates, meaning transcription results may evolve over time",
                "default": "false",
                "enum": [
                  "true",
                  "false"
                ]
              },
              "keyterm": {
                "description": "Key term prompting can boost or suppress specialized terminology and brands. Only compatible with Nova-3"
              },
              "keywords": {
                "description": "Keywords can boost or suppress specialized terminology and brands"
              },
              "language": {
                "description": "The [BCP-47 language tag](https://tools.ietf.org/html/bcp47) that hints at the primary spoken language. Depending on the Model you choose only certain languages are available",
                "default": "en",
                "enum": [
                  "bg",
                  "ca",
                  "cs",
                  "da",
                  "da-DK",
                  "de",
                  "de-CH",
                  "el",
                  "en",
                  "en-AU",
                  "en-GB",
                  "en-IN",
                  "en-NZ",
                  "en-US",
                  "es",
                  "es-419",
                  "es-LATAM",
                  "et",
                  "fi",
                  "fr",
                  "fr-CA",
                  "hi",
                  "hi-Latn",
                  "hu",
                  "id",
                  "it",
                  "ja",
                  "ko",
                  "ko-KR",
                  "lt",
                  "lv",
                  "ms",
                  "multi",
                  "nl",
                  "nl-BE",
                  "no",
                  "pl",
                  "pt",
                  "pt-BR",
                  "pt-PT",
                  "ro",
                  "ru",
                  "sk",
                  "sv",
                  "sv-SE",
                  "taq",
                  "th",
                  "th-TH",
                  "tr",
                  "uk",
                  "vi",
                  "zh",
                  "zh-CN",
                  "zh-HK",
                  "zh-Hans",
                  "zh-Hant",
                  "zh-TW"
                ]
              },
              "mip_opt_out": {
                "description": "Opts out requests from the Deepgram Model Improvement Program. Refer to our Docs for pricing impacts before setting this to true. https://dpgr.am/deepgram-mip",
                "default": "false"
              },
              "model": {
                "description": "AI model to use for the transcription",
                "enum": [
                  "nova-3",
                  "nova-3-general",
                  "nova-3-medical",
                  "nova-2",
                  "nova-2-general",
                  "nova-2-meeting",
                  "nova-2-finance",
                  "nova-2-conversationalai",
                  "nova-2-voicemail",
                  "nova-2-video",
                  "nova-2-medical",
                  "nova-2-drivethru",
                  "nova-2-automotive",
                  "nova",
                  "nova-general",
                  "nova-phonecall",
                  "nova-medical",
                  "enhanced",
                  "enhanced-general",
                  "enhanced-meeting",
                  "enhanced-phonecall",
                  "enhanced-finance",
                  "base",
                  "meeting",
                  "phonecall",
                  "finance",
                  "conversationalai",
                  "voicemail",
                  "video",
                  "custom"
                ]
              },
              "multichannel": {
                "description": "Transcribe each audio channel independently",
                "default": "false",
                "enum": [
                  "true",
                  "false"
                ]
              },
              "numerals": {
                "description": "Convert numbers from written format to numerical format",
                "default": "false",
                "enum": [
                  "true",
                  "false"
                ]
              },
              "profanity_filter": {
                "description": "Profanity Filter looks for recognized profanity and converts it to the nearest recognized non-profane word or removes it from the transcript completely",
                "default": "false",
                "enum": [
                  "true",
                  "false"
                ]
              },
              "punctuate": {
                "description": "Add punctuation and capitalization to the transcript",
                "default": "false",
                "enum": [
                  "true",
                  "false"
                ]
              },
              "redact": {
                "description": "Redaction removes sensitive information from your transcripts",
                "default": "false",
                "enum": [
                  "true",
                  "false",
                  "pci",
                  "numbers",
                  "aggressive_numbers",
                  "ssn"
                ]
              },
              "replace": {
                "description": "Search for terms or phrases in submitted audio and replaces them"
              },
              "search": {
                "description": "Search for terms or phrases in submitted audio"
              },
              "smart_format": {
                "description": "Apply formatting to transcript output. When set to true, additional formatting will be applied to transcripts to improve readability",
                "default": "false",
                "enum": [
                  "true",
                  "false"
                ]
              },
              "tag": {
                "description": "Label your requests for the purpose of identification during usage reporting"
              },
              "utterance_end_ms": {
                "description": "Indicates how long Deepgram will wait to send an UtteranceEnd message after a word has been transcribed. Use with interim_results"
              },
              "vad_events": {
                "description": "Indicates that speech has started. You'll begin receiving Speech Started messages upon speech starting",
                "default": "false",
                "enum": [
                  "true",
                  "false"
                ]
              },
              "version": {
                "description": "Version of an AI model to use",
                "default": "latest"
              }
            },
            "title": "Deepgram Real-time Transcription Settings",
            "description": "Docs: https://developers.deepgram.com/reference/streaming"
          },
          "gladia_v2_streaming": {
            "type": "object",
            "properties": {
              "custom_metadata": {
                "type": "object",
                "description": "Custom metadata you can attach to this live transcription",
                "example": {
                  "user": "John Doe"
                }
              },
              "model": {
                "type": "string",
                "description": "The model used to process the audio. \"solaria-1\" is used by default.",
                "default": "solaria-1",
                "enum": [
                  "solaria-1"
                ]
              },
              "endpointing": {
                "type": "number",
                "description": "The endpointing duration in seconds. Endpointing is the duration of silence which will cause an utterance to be considered as finished",
                "default": 0.05,
                "minimum": 0.01,
                "maximum": 10
              },
              "maximum_duration_without_endpointing": {
                "type": "number",
                "description": "The maximum duration in seconds without endpointing. If endpointing is not detected after this duration, current utterance will be considered as finished",
                "default": 5,
                "minimum": 5,
                "maximum": 60
              },
              "language_config": {
                "properties": {
                  "languages": {
                    "type": "array",
                    "description": "If one language is set, it will be used for the transcription. Otherwise, language will be auto-detected by the model.",
                    "default": [],
                    "items": {
                      "type": "string",
                      "enum": [
                        "af",
                        "sq",
                        "am",
                        "ar",
                        "hy",
                        "as",
                        "az",
                        "ba",
                        "eu",
                        "be",
                        "bn",
                        "bs",
                        "br",
                        "bg",
                        "ca",
                        "zh",
                        "hr",
                        "cs",
                        "da",
                        "nl",
                        "en",
                        "et",
                        "fo",
                        "fi",
                        "fr",
                        "gl",
                        "ka",
                        "de",
                        "el",
                        "gu",
                        "ht",
                        "ha",
                        "haw",
                        "he",
                        "hi",
                        "hu",
                        "is",
                        "id",
                        "it",
                        "ja",
                        "jv",
                        "kn",
                        "kk",
                        "km",
                        "ko",
                        "lo",
                        "la",
                        "lv",
                        "ln",
                        "lt",
                        "lb",
                        "mk",
                        "mg",
                        "ms",
                        "ml",
                        "mt",
                        "mi",
                        "mr",
                        "mn",
                        "mymr",
                        "ne",
                        "no",
                        "nn",
                        "oc",
                        "ps",
                        "fa",
                        "pl",
                        "pt",
                        "pa",
                        "ro",
                        "ru",
                        "sa",
                        "sr",
                        "sn",
                        "sd",
                        "si",
                        "sk",
                        "sl",
                        "so",
                        "es",
                        "su",
                        "sw",
                        "sv",
                        "tl",
                        "tg",
                        "ta",
                        "tt",
                        "te",
                        "th",
                        "bo",
                        "tr",
                        "tk",
                        "uk",
                        "ur",
                        "uz",
                        "vi",
                        "cy",
                        "yi",
                        "yo",
                        "jp"
                      ]
                    }
                  },
                  "code_switching": {
                    "type": "boolean",
                    "description": "If true, language will be auto-detected on each utterance. Otherwise, language will be auto-detected on first utterance and then used for the rest of the transcription. If one language is set, this option will be ignored.",
                    "default": false
                  }
                },
                "type": "object",
                "description": "Specify the language configuration"
              },
              "pre_processing": {
                "properties": {
                  "audio_enhancer": {
                    "type": "boolean",
                    "description": "If true, apply pre-processing to the audio stream to enhance the quality.",
                    "default": false
                  },
                  "speech_threshold": {
                    "type": "number",
                    "description": "Sensitivity configuration for Speech Threshold. A value close to 1 will apply stricter thresholds, making it less likely to detect background sounds as speech.",
                    "default": 0.6,
                    "minimum": 0,
                    "maximum": 1
                  }
                },
                "type": "object",
                "description": "Specify the pre-processing configuration"
              },
              "realtime_processing": {
                "properties": {
                  "custom_vocabulary": {
                    "type": "boolean",
                    "description": "If true, enable custom vocabulary for the transcription.",
                    "default": false
                  },
                  "custom_vocabulary_config": {
                    "properties": {
                      "vocabulary": {
                        "description": "Specific vocabulary list to feed the transcription model with. Each item can be a string or an object with the following properties: value, intensity, pronunciations, language.",
                        "example": [
                          "Westeros",
                          {
                            "value": "Stark"
                          },
                          {
                            "value": "Night's Watch",
                            "pronunciations": [
                              "Nightz Watch"
                            ],
                            "intensity": 0.4,
                            "language": "en"
                          }
                        ],
                        "type": "array",
                        "items": {
                          "oneOf": [
                            {
                              "type": "object",
                              "properties": {
                                "value": {
                                  "type": "string",
                                  "description": "The text used to replace in the transcription.",
                                  "example": "Gladia"
                                },
                                "intensity": {
                                  "type": "number",
                                  "description": "The global intensity of the feature.",
                                  "example": 0.5,
                                  "minimum": 0,
                                  "maximum": 1
                                },
                                "pronunciations": {
                                  "description": "The pronunciations used in the transcription.",
                                  "type": "array",
                                  "items": {
                                    "type": "string"
                                  }
                                },
                                "language": {
                                  "type": "string",
                                  "description": "Specify the language in which it will be pronounced when sound comparison occurs. Default to transcription language.",
                                  "example": "en"
                                }
                              },
                              "required": [
                                "value"
                              ]
                            },
                            {
                              "type": "string"
                            }
                          ]
                        }
                      },
                      "default_intensity": {
                        "type": "number",
                        "description": "Default intensity for the custom vocabulary",
                        "example": 0.5,
                        "minimum": 0,
                        "maximum": 1
                      }
                    },
                    "required": [
                      "vocabulary"
                    ],
                    "type": "object",
                    "description": "Custom vocabulary configuration, if `custom_vocabulary` is enabled"
                  },
                  "custom_spelling": {
                    "type": "boolean",
                    "description": "If true, enable custom spelling for the transcription.",
                    "default": false
                  },
                  "custom_spelling_config": {
                    "properties": {
                      "spelling_dictionary": {
                        "type": "object",
                        "description": "The list of spelling applied on the audio transcription",
                        "example": {
                          "Gettleman": [
                            "gettleman"
                          ],
                          "SQL": [
                            "Sequel"
                          ]
                        }
                      }
                    },
                    "required": [
                      "spelling_dictionary"
                    ],
                    "type": "object",
                    "description": "Custom spelling configuration, if `custom_spelling` is enabled"
                  },
                  "translation": {
                    "type": "boolean",
                    "description": "If true, enable translation for the transcription",
                    "default": false
                  },
                  "translation_config": {
                    "properties": {
                      "target_languages": {
                        "type": "array",
                        "example": [
                          "en"
                        ],
                        "minItems": 1,
                        "items": {
                          "type": "string",
                          "description": "The target language in `iso639-1` format",
                          "enum": [
                            "af",
                            "sq",
                            "am",
                            "ar",
                            "hy",
                            "as",
                            "ast",
                            "az",
                            "ba",
                            "eu",
                            "be",
                            "bn",
                            "bs",
                            "br",
                            "bg",
                            "my",
                            "ca",
                            "ceb",
                            "zh",
                            "hr",
                            "cs",
                            "da",
                            "nl",
                            "en",
                            "et",
                            "fo",
                            "fi",
                            "nl",
                            "fr",
                            "fy",
                            "ff",
                            "gd",
                            "gl",
                            "lg",
                            "ka",
                            "de",
                            "el",
                            "gu",
                            "ht",
                            "ha",
                            "haw",
                            "he",
                            "hi",
                            "hu",
                            "is",
                            "ig",
                            "ilo",
                            "id",
                            "ga",
                            "it",
                            "ja",
                            "jp",
                            "jv",
                            "kn",
                            "kk",
                            "km",
                            "ko",
                            "lo",
                            "la",
                            "lv",
                            "ln",
                            "lt",
                            "lb",
                            "mk",
                            "mg",
                            "ms",
                            "ml",
                            "mt",
                            "mi",
                            "mr",
                            "mo",
                            "mn",
                            "mymr",
                            "ne",
                            "no",
                            "nn",
                            "oc",
                            "or",
                            "pa",
                            "ps",
                            "fa",
                            "pl",
                            "pt",
                            "pa",
                            "ro",
                            "ru",
                            "sa",
                            "sr",
                            "sn",
                            "sd",
                            "si",
                            "sk",
                            "sl",
                            "so",
                            "es",
                            "su",
                            "sw",
                            "ss",
                            "sv",
                            "tl",
                            "tg",
                            "ta",
                            "tt",
                            "te",
                            "th",
                            "bo",
                            "tn",
                            "tr",
                            "tk",
                            "uk",
                            "ur",
                            "uz",
                            "vi",
                            "cy",
                            "wo",
                            "xh",
                            "yi",
                            "yo",
                            "zu"
                          ]
                        }
                      },
                      "model": {
                        "type": "string",
                        "description": "Model you want the translation model to use to translate",
                        "default": "base",
                        "enum": [
                          "base",
                          "enhanced"
                        ]
                      },
                      "match_original_utterances": {
                        "type": "boolean",
                        "description": "Align translated utterances with the original ones",
                        "default": true
                      },
                      "lipsync": {
                        "type": "boolean",
                        "description": "Whether to apply lipsync to the translated transcription. ",
                        "default": true
                      },
                      "context_adaptation": {
                        "type": "boolean",
                        "description": "Enables or disables context-aware translation features that allow the model to adapt translations based on provided context.",
                        "default": true
                      },
                      "context": {
                        "type": "string",
                        "description": "Context information to improve translation accuracy"
                      },
                      "informal": {
                        "type": "boolean",
                        "description": "Forces the translation to use informal language forms when available in the target language.",
                        "default": false
                      }
                    },
                    "required": [
                      "target_languages"
                    ],
                    "type": "object",
                    "description": "Translation configuration, if `translation` is enabled"
                  },
                  "named_entity_recognition": {
                    "type": "boolean",
                    "description": "If true, enable named entity recognition for the transcription.",
                    "default": false
                  },
                  "sentiment_analysis": {
                    "type": "boolean",
                    "description": "If true, enable sentiment analysis for the transcription.",
                    "default": false
                  }
                },
                "type": "object",
                "description": "Specify the realtime processing configuration"
              },
              "post_processing": {
                "properties": {
                  "summarization": {
                    "type": "boolean",
                    "description": "If true, generates summarization for the whole transcription.",
                    "default": false
                  },
                  "summarization_config": {
                    "properties": {
                      "type": {
                        "type": "string",
                        "description": "The type of summarization to apply",
                        "default": "general",
                        "enum": [
                          "general",
                          "bullet_points",
                          "concise"
                        ]
                      }
                    },
                    "type": "object",
                    "description": "Summarization configuration, if `summarization` is enabled"
                  },
                  "chapterization": {
                    "type": "boolean",
                    "description": "If true, generates chapters for the whole transcription.",
                    "default": false
                  }
                },
                "type": "object",
                "description": "Specify the post-processing configuration"
              },
              "messages_config": {
                "properties": {
                  "receive_final_transcripts": {
                    "type": "boolean",
                    "description": "If true, final utterance will be sent to websocket.",
                    "default": true
                  },
                  "receive_speech_events": {
                    "type": "boolean",
                    "description": "If true, begin and end speech events will be sent to websocket.",
                    "default": true
                  },
                  "receive_pre_processing_events": {
                    "type": "boolean",
                    "description": "If true, pre-processing events will be sent to websocket.",
                    "default": true
                  },
                  "receive_realtime_processing_events": {
                    "type": "boolean",
                    "description": "If true, realtime processing events will be sent to websocket.",
                    "default": true
                  },
                  "receive_post_processing_events": {
                    "type": "boolean",
                    "description": "If true, post-processing events will be sent to websocket.",
                    "default": true
                  },
                  "receive_acknowledgments": {
                    "type": "boolean",
                    "description": "If true, acknowledgments will be sent to websocket.",
                    "default": true
                  },
                  "receive_errors": {
                    "type": "boolean",
                    "description": "If true, errors will be sent to websocket.",
                    "default": true
                  },
                  "receive_lifecycle_events": {
                    "type": "boolean",
                    "description": "If true, lifecycle events will be sent to websocket.",
                    "default": false
                  }
                },
                "type": "object",
                "description": "Specify the websocket messages configuration"
              },
              "callback": {
                "type": "boolean",
                "description": "If true, messages will be sent to configured url.",
                "default": false
              },
              "callback_config": {
                "properties": {
                  "url": {
                    "type": "string",
                    "description": "URL on which we will do a `POST` request with configured messages",
                    "example": "https://callback.example",
                    "format": "uri"
                  },
                  "receive_final_transcripts": {
                    "type": "boolean",
                    "description": "If true, final utterance will be sent to the defined callback.",
                    "default": true
                  },
                  "receive_speech_events": {
                    "type": "boolean",
                    "description": "If true, begin and end speech events will be sent to the defined callback.",
                    "default": false
                  },
                  "receive_pre_processing_events": {
                    "type": "boolean",
                    "description": "If true, pre-processing events will be sent to the defined callback.",
                    "default": true
                  },
                  "receive_realtime_processing_events": {
                    "type": "boolean",
                    "description": "If true, realtime processing events will be sent to the defined callback.",
                    "default": true
                  },
                  "receive_post_processing_events": {
                    "type": "boolean",
                    "description": "If true, post-processing events will be sent to the defined callback.",
                    "default": true
                  },
                  "receive_acknowledgments": {
                    "type": "boolean",
                    "description": "If true, acknowledgments will be sent to the defined callback.",
                    "default": false
                  },
                  "receive_errors": {
                    "type": "boolean",
                    "description": "If true, errors will be sent to the defined callback.",
                    "default": false
                  },
                  "receive_lifecycle_events": {
                    "type": "boolean",
                    "description": "If true, lifecycle events will be sent to the defined callback.",
                    "default": true
                  }
                },
                "type": "object",
                "description": "Specify the callback configuration"
              }
            },
            "title": "GladiaV2 Real-time Transcription Settings",
            "description": "Docs: https://docs.gladia.io/api-reference/v2/live/init"
          },
          "rev_streaming": {
            "type": "object",
            "properties": {
              "obscure_expletives": {
                "type": "boolean"
              },
              "delete_after": {
                "type": "string",
                "format": "date-span"
              },
              "audio_options._content_type": {
                "type": "string"
              },
              "audio_options._layout": {
                "type": "string"
              },
              "audio_options._rate": {
                "type": "integer",
                "format": "int32"
              },
              "audio_options._format": {
                "type": "string"
              },
              "audio_options._channels": {
                "type": "integer",
                "format": "int32"
              },
              "transcriber": {
                "enum": [
                  0,
                  1
                ],
                "type": "integer",
                "format": "int32"
              },
              "language": {
                "type": "string"
              },
              "metadata": {
                "maxLength": 512,
                "minLength": 0,
                "type": "string"
              },
              "filter_profanity": {
                "type": "boolean"
              },
              "remove_disfluencies": {
                "type": "boolean"
              },
              "detailed_partials": {
                "type": "boolean"
              },
              "custom_vocabulary_id": {
                "type": "string"
              },
              "delete_after_seconds": {
                "type": "integer",
                "format": "int32"
              },
              "max_segment_duration_seconds": {
                "maximum": 30,
                "minimum": 5,
                "type": "integer",
                "format": "int32"
              },
              "max_connection_wait_seconds": {
                "maximum": 600,
                "minimum": 60,
                "type": "integer",
                "format": "int32"
              },
              "allow_interruption": {
                "type": "boolean"
              },
              "enable_speaker_switch": {
                "type": "boolean"
              },
              "start_ts": {
                "type": "string",
                "format": "date-span"
              },
              "skip_postprocessing": {
                "type": "boolean"
              },
              "priority": {
                "enum": [
                  0,
                  1
                ],
                "type": "integer",
                "format": "int32"
              },
              "user_agent": {
                "type": "string"
              }
            },
            "title": "Rev Real-time Transcription Settings",
            "description": "Docs: https://docs.rev.ai/api/streaming/requests/"
          },
          "aws_transcribe_streaming": {
            "type": "object",
            "description": "You must specify either:\n- `language_code`(e.g `en-US`) OR\n- Set `language_identification` to `true` AND specify `language_options`(e.g `en-US,fr-FR,es-US,de-DE,it-IT`).\n\nDocs: https://docs.aws.amazon.com/transcribe/latest/APIReference/API_streaming_StartStreamTranscription.html",
            "properties": {
              "language_code": {
                "type": "string",
                "description": "Specify the language code that represents the language spoken. If you're unsure of the language spoken in your audio, consider using IdentifyLanguage to enable automatic language identification."
              },
              "vocabulary_filter_method": {
                "type": "string",
                "description": "Specify how you want your vocabulary filter applied to your transcript. To replace words with ***, choose mask. To delete words, choose remove. To flag words without changing them, choose tag."
              },
              "vocabulary_filter_name": {
                "type": "string",
                "description": "Specify the name of the custom vocabulary filter that you want to use when processing your transcription. Note that vocabulary filter names are case sensitive.  If you use Amazon Transcribe in multiple Regions, the vocabulary filter must be available in Amazon Transcribe in each Region. If you include IdentifyLanguage and want to use one or more vocabulary filters with your transcription, use the VocabularyFilterNames parameter instead."
              },
              "vocabulary_name": {
                "type": "string",
                "description": "Specify the name of the custom vocabulary that you want to use when processing your transcription. Note that vocabulary names are case sensitive. If you use Amazon Transcribe multiple Regions, the vocabulary must be available in Amazon Transcribe in each Region. If you include IdentifyLanguage and want to use one or more custom vocabularies with your transcription, use the VocabularyNames parameter instead."
              },
              "region": {
                "type": "string",
                "description": "The Amazon Web Services Region in which to use Amazon Transcribe. If you don't specify a Region, then the MediaRegion of the meeting is used. However, if Amazon Transcribe is not available in the MediaRegion, then a TranscriptFailed event is sent. Use auto to use Amazon Transcribe in a Region near the meeting’s MediaRegion. For more information, refer to Choosing a transcription Region in the Amazon Chime SDK Developer Guide."
              },
              "enable_partial_results_stabilization": {
                "type": "boolean",
                "description": "Enables partial result stabilization for your transcription. Partial result stabilization can reduce latency in your output, but may impact accuracy."
              },
              "partial_results_stability": {
                "type": "string",
                "description": "Specify the level of stability to use when you enable partial results stabilization (EnablePartialResultsStabilization). Low stability provides the highest accuracy. High stability transcribes faster, but with slightly lower accuracy."
              },
              "content_identification_type": {
                "type": "string",
                "description": "Labels all personally identifiable information (PII) identified in your transcript. If you don't include PiiEntityTypes, all PII is identified.  You can’t set ContentIdentificationType and ContentRedactionType. "
              },
              "content_redaction_type": {
                "type": "string",
                "description": "Content redaction is performed at the segment level. If you don't include PiiEntityTypes, all PII is redacted.  You can’t set ContentRedactionType and ContentIdentificationType. "
              },
              "pii_entity_types": {
                "type": "string",
                "description": "Specify which types of personally identifiable information (PII) you want to redact in your transcript. You can include as many types as you'd like, or you can select ALL. Values must be comma-separated and can include: ADDRESS, BANK_ACCOUNT_NUMBER, BANK_ROUTING, CREDIT_DEBIT_CVV, CREDIT_DEBIT_EXPIRY CREDIT_DEBIT_NUMBER, EMAIL,NAME, PHONE, PIN, SSN, or ALL. Note that if you include PiiEntityTypes, you must also include ContentIdentificationType or ContentRedactionType. If you include ContentRedactionType or ContentIdentificationType, but do not include PiiEntityTypes, all PII is redacted or identified."
              },
              "language_model_name": {
                "type": "string",
                "description": "Specify the name of the custom language model that you want to use when processing your transcription. Note that language model names are case sensitive. The language of the specified language model must match the language code. If the languages don't match, the custom language model isn't applied. There are no errors or warnings associated with a language mismatch. If you use Amazon Transcribe in multiple Regions, the custom language model must be available in Amazon Transcribe in each Region."
              },
              "identify_language": {
                "type": "boolean",
                "description": "Enables automatic language identification for your transcription. If you include IdentifyLanguage, you can optionally use LanguageOptions to include a list of language codes that you think may be present in your audio stream. Including language options can improve transcription accuracy. You can also use PreferredLanguage to include a preferred language. Doing so can help Amazon Transcribe identify the language faster. You must include either LanguageCode or IdentifyLanguage. Language identification can't be combined with custom language models or redaction."
              },
              "language_options": {
                "type": "string",
                "description": "Specify two or more language codes that represent the languages you think may be present in your media; including more than five is not recommended. If you're unsure what languages are present, do not include this parameter. Including language options can improve the accuracy of language identification. If you include LanguageOptions, you must also include IdentifyLanguage.  You can only include one language dialect per language. For example, you cannot include en-US and en-AU. "
              },
              "preferred_language": {
                "type": "string",
                "description": "Specify a preferred language from the subset of languages codes you specified in LanguageOptions. You can only use this parameter if you include IdentifyLanguage and LanguageOptions."
              },
              "vocabulary_names": {
                "type": "string",
                "description": "Specify the names of the custom vocabularies that you want to use when processing your transcription. Note that vocabulary names are case sensitive. If you use Amazon Transcribe in multiple Regions, the vocabulary must be available in Amazon Transcribe in each Region. If you don't include IdentifyLanguage and want to use a custom vocabulary with your transcription, use the VocabularyName parameter instead."
              },
              "vocabulary_filter_names": {
                "type": "string",
                "description": "Specify the names of the custom vocabulary filters that you want to use when processing your transcription. Note that vocabulary filter names are case sensitive. If you use Amazon Transcribe in multiple Regions, the vocabulary filter must be available in Amazon Transcribe in each Region.  If you're not including IdentifyLanguage and want to use a custom vocabulary filter with your transcription, use the VocabularyFilterName parameter instead."
              }
            },
            "oneOf": [
              {
                "required": [
                  "language_code"
                ]
              },
              {
                "required": [
                  "identify_language",
                  "language_options"
                ],
                "properties": {
                  "identify_language": {
                    "type": "boolean",
                    "enum": [
                      true
                    ]
                  }
                }
              }
            ],
            "title": "AWS Transcribe Streaming Transcription Settings"
          },
          "speechmatics_streaming": {
            "type": "object",
            "properties": {
              "language": {
                "type": "string"
              },
              "domain": {
                "type": "string",
                "description": "Request a specialized model based on 'language' but optimized for a particular field, e.g. \"finance\" or \"medical\"."
              },
              "output_locale": {
                "type": "string",
                "minLength": 1
              },
              "additional_vocab": {
                "type": "array",
                "items": {
                  "type": "object",
                  "oneOf": [
                    {
                      "type": "string",
                      "minLength": 1
                    },
                    {
                      "type": "object",
                      "properties": {
                        "content": {
                          "type": "string",
                          "minLength": 1
                        },
                        "sounds_like": {
                          "type": "array",
                          "items": {
                            "type": "string",
                            "minLength": 1
                          },
                          "minItems": 1
                        }
                      },
                      "required": [
                        "content"
                      ]
                    }
                  ]
                }
              },
              "diarization": {
                "type": "string",
                "enum": [
                  "none",
                  "speaker"
                ]
              },
              "max_delay": {
                "type": "number",
                "minimum": 0
              },
              "max_delay_mode": {
                "type": "string",
                "enum": [
                  "flexible",
                  "fixed"
                ]
              },
              "speaker_diarization_config": {
                "type": "object",
                "properties": {
                  "max_speakers": {
                    "type": "number",
                    "format": "integer",
                    "minimum": 2,
                    "maximum": 100
                  },
                  "prefer_current_speaker": {
                    "type": "boolean"
                  },
                  "speaker_sensitivity": {
                    "type": "number",
                    "format": "float",
                    "minimum": 0,
                    "maximum": 1
                  }
                }
              },
              "audio_filtering_config": {
                "type": "object",
                "properties": {
                  "volume_threshold": {
                    "type": "number",
                    "format": "float",
                    "minimum": 0,
                    "maximum": 100
                  }
                }
              },
              "transcript_filtering_config": {
                "type": "object",
                "properties": {
                  "remove_disfluencies": {
                    "type": "boolean"
                  },
                  "replacements": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "from": {
                          "type": "string"
                        },
                        "to": {
                          "type": "string"
                        }
                      },
                      "required": [
                        "from",
                        "to"
                      ]
                    }
                  }
                }
              },
              "enable_partials": {
                "type": "boolean",
                "default": false
              },
              "enable_entities": {
                "type": "boolean",
                "default": true
              },
              "operating_point": {
                "type": "string",
                "enum": [
                  "standard",
                  "enhanced"
                ]
              },
              "punctuation_overrides": {
                "type": "object",
                "properties": {
                  "permitted_marks": {
                    "type": "array",
                    "description": "The punctuation marks which the client is prepared to accept in transcription output, or the special value 'all' (the default). Unsupported marks are ignored. This value is used to guide the transcription process.",
                    "items": {
                      "pattern": "^(.|all)$",
                      "type": "string"
                    }
                  },
                  "sensitivity": {
                    "type": "number",
                    "description": "Ranges between zero and one. Higher values will produce more punctuation. The default is 0.5.",
                    "format": "float",
                    "maximum": 1,
                    "minimum": 0
                  }
                }
              },
              "conversation_config": {
                "type": "object",
                "properties": {
                  "end_of_utterance_silence_trigger": {
                    "type": "number",
                    "format": "float",
                    "minimum": 0,
                    "maximum": 2,
                    "default": 0
                  }
                },
                "description": "This mode will detect when a speaker has stopped talking. The end_of_utterance_silence_trigger is the time in seconds after which the server will assume that the speaker has finished speaking, and will emit an EndOfUtterance message. A value of 0 disables the feature."
              }
            },
            "required": [
              "language"
            ],
            "title": "Speechmatics Real-time Transcription Settings",
            "description": "You must specify `language` (e.g `en`)\n\nDocs: https://docs.speechmatics.com/rt-api-ref#transcription-config"
          },
          "elevenlabs_streaming": {
            "type": "object",
            "properties": {
              "model_id": {
                "description": "The model to use for transcription.",
                "type": "string",
                "default": "eleven_whisper_v2_realtime"
              },
              "language_code": {
                "description": "ISO 639-1 two-letter language code. When not specified, the model auto-detects the language.",
                "type": "string"
              },
              "previous_text": {
                "description": "Text from a previous transcription session to provide context for the model. Sent in the first message to the WebSocket.",
                "type": "string"
              }
            },
            "title": "ElevenLabs Real-time Transcription Settings",
            "description": "Docs: https://elevenlabs.io/docs/api-reference/speech-to-text"
          },
          "meeting_captions": {
            "type": "object",
            "properties": {
              "language_code": {
                "enum": [
                  "cs",
                  "de",
                  "en",
                  "es",
                  "fil",
                  "fr",
                  "he",
                  "hi",
                  "it",
                  "ja",
                  "ko",
                  "nl",
                  "pl",
                  "pt",
                  "pt-BR",
                  "ro",
                  "ru",
                  "sv",
                  "th",
                  "tr",
                  "uk",
                  "vi",
                  "zh",
                  null
                ],
                "type": "string",
                "description": "* `cs` - Czech\n* `de` - German\n* `en` - English\n* `es` - Spanish\n* `fil` - Filipino\n* `fr` - French\n* `he` - Hebrew\n* `hi` - Hindi\n* `it` - Italian\n* `ja` - Japanese\n* `ko` - Korean\n* `nl` - Dutch\n* `pl` - Polish\n* `pt` - Portuguese\n* `pt-BR` - Portuguese (Brazil)\n* `ro` - Romanian\n* `ru` - Russian\n* `sv` - Swedish\n* `th` - Thai\n* `tr` - Turkish\n* `uk` - Ukrainian\n* `vi` - Vietnamese\n* `zh` - Chinese",
                "nullable": true,
                "title": "Language for captions. If not specified, the selection is meeting platform-specific."
              }
            }
          },
          "zoom_rtms": {
            "type": "object",
            "title": "Zoom Real-Time Media Streams Transcription"
          }
        },
        "required": [
          "assembly_ai_async",
          "aws_transcribe_async",
          "deepgram_async",
          "elevenlabs_async",
          "gladia_v2_async",
          "google_speech_v2_async",
          "recallai_async",
          "rev_async",
          "speechmatics_async"
        ]
      },
      "TranscriptArtifactShortcut": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "readOnly": true
          },
          "created_at": {
            "type": "string",
            "format": "date-time",
            "readOnly": true
          },
          "status": {
            "allOf": [
              {
                "$ref": "#/components/schemas/ArtifactStatus"
              }
            ],
            "readOnly": true
          },
          "metadata": {
            "type": "object",
            "additionalProperties": {
              "type": "string"
            }
          },
          "data": {
            "allOf": [
              {
                "$ref": "#/components/schemas/TranscriptArtifactData"
              }
            ],
            "readOnly": true
          },
          "diarization": {
            "allOf": [
              {
                "$ref": "#/components/schemas/TranscriptArtifactDiarization"
              }
            ],
            "readOnly": true,
            "nullable": true
          },
          "provider": {
            "allOf": [
              {
                "$ref": "#/components/schemas/TranscriptArtifactProvider"
              }
            ],
            "readOnly": true
          }
        },
        "required": [
          "created_at",
          "data",
          "diarization",
          "id",
          "metadata",
          "provider",
          "status"
        ]
      },
      "VideoMixedArtifactData": {
        "type": "object",
        "properties": {
          "download_url": {
            "type": "string",
            "format": "uri",
            "readOnly": true,
            "nullable": true
          }
        },
        "required": [
          "download_url"
        ]
      },
      "VideoMixedArtifactShortcut": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid",
            "readOnly": true
          },
          "created_at": {
            "type": "string",
            "format": "date-time",
            "readOnly": true
          },
          "status": {
            "allOf": [
              {
                "$ref": "#/components/schemas/ArtifactStatus"
              }
            ],
            "readOnly": true
          },
          "metadata": {
            "type": "object",
            "additionalProperties": {
              "type": "string"
            }
          },
          "data": {
            "allOf": [
              {
                "$ref": "#/components/schemas/VideoMixedArtifactData"
              }
            ],
            "readOnly": true
          },
          "format": {
            "allOf": [
              {
                "$ref": "#/components/schemas/Format3b3Enum"
              }
            ],
            "readOnly": true,
            "description": "Format of the mixed video file\n\n* `mp4` - Mp4"
          }
        },
        "required": [
          "created_at",
          "data",
          "format",
          "id",
          "metadata",
          "status"
        ]
      }
    },
    "securitySchemes": {
      "tokenAuth": {
        "type": "apiKey",
        "in": "header",
        "name": "Authorization",
        "description": "Token-based authentication with required prefix \"Token\""
      }
    }
  },
  "servers": [
    {
      "url": "https://us-east-1.recall.ai",
      "description": "Recall.ai API"
    },
    {
      "url": "https://eu-central-1.recall.ai",
      "description": "European Recall.ai API"
    },
    {
      "url": "https://ap-northeast-1.recall.ai",
      "description": "Asia Recall.ai API"
    },
    {
      "url": "https://us-west-2.recall.ai",
      "description": "Pay-as-you-go Recall.ai API"
    }
  ]
}
```