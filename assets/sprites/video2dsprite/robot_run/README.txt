Video2dsprite output (Grok Build pipeline)
==========================================
base/           base still on #FF00FF
video/          imagine_image_to_video clip
frames-raw/     decoded frames
frames-clean/   chroma-keyed RGBA frames
sprite/         sampled normalized sprites + strips/grids/GIFs
pipeline-meta.json

This folder was produced for Grok Build (imagine_text_to_image + imagine_image_to_video).
Codex/other agents cannot run the video step; they can still re-sample
existing frames with: python video2dsprite.py sample --clean-dir ...

{
  "mode": "sample",
  "clean_dir": "/workspace/assets/sprites/video2dsprite/robot_run/frames-clean",
  "total_clean": 136,
  "sets": [
    {
      "count": 8,
      "tag": "",
      "sprites": [
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/sprite_01.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/sprite_02.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/sprite_03.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/sprite_04.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/sprite_05.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/sprite_06.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/sprite_07.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/sprite_08.png"
      ],
      "strip": "/workspace/assets/sprites/video2dsprite/robot_run/sprite/run-strip-8.png",
      "grid": "/workspace/assets/sprites/video2dsprite/robot_run/sprite/run-grid-8.png",
      "gif": "/workspace/assets/sprites/video2dsprite/robot_run/sprite/run-preview-8.gif",
      "gif_ms": 80,
      "indices": [
        0,
        19,
        39,
        58,
        77,
        96,
        116,
        135
      ]
    },
    {
      "count": 12,
      "tag": "x12",
      "sprites": [
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x12/sprite_01.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x12/sprite_02.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x12/sprite_03.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x12/sprite_04.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x12/sprite_05.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x12/sprite_06.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x12/sprite_07.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x12/sprite_08.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x12/sprite_09.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x12/sprite_10.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x12/sprite_11.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x12/sprite_12.png"
      ],
      "strip": "/workspace/assets/sprites/video2dsprite/robot_run/sprite/run-strip-12.png",
      "grid": "/workspace/assets/sprites/video2dsprite/robot_run/sprite/run-grid-12.png",
      "gif": "/workspace/assets/sprites/video2dsprite/robot_run/sprite/run-preview-12.gif",
      "gif_ms": 60,
      "indices": [
        0,
        12,
        25,
        37,
        49,
        61,
        74,
        86,
        98,
        110,
        123,
        135
      ]
    },
    {
      "count": 16,
      "tag": "x16",
      "sprites": [
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x16/sprite_01.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x16/sprite_02.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x16/sprite_03.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x16/sprite_04.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x16/sprite_05.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x16/sprite_06.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x16/sprite_07.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x16/sprite_08.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x16/sprite_09.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x16/sprite_10.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x16/sprite_11.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x16/sprite_12.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x16/sprite_13.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x16/sprite_14.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x16/sprite_15.png",
        "/workspace/assets/sprites/video2dsprite/robot_run/sprite/x16/sprite_16.png"
      ],
      "strip": "/workspace/assets/sprites/video2dsprite/robot_run/sprite/run-strip-16.png",
      "grid": "/workspace/assets/sprites/video2dsprite/robot_run/sprite/run-grid-16.png",
      "gif": "/workspace/assets/sprites/video2dsprite/robot_run/sprite/run-preview-16.gif",
      "gif_ms": 60,
      "indices": [
        0,
        9,
        18,
        27,
        36,
        45,
        54,
        63,
        72,
        81,
        90,
        99,
        108,
        117,
        126,
        135
      ]
    }
  ]
}
