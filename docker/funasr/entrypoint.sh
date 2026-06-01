#!/bin/bash
set -e

echo "=== FunASR 离线转写服务启动中 ==="

cd /FunASR/runtime

bash run_server.sh \
  --download-model-dir /workspace/models \
  --vad-dir damo/speech_fsmn_vad_zh-cn-16k-common-onnx \
  --model-dir damo/speech_paraformer-large-vad-punc_asr_nat-zh-cn-16k-common-vocab8404-onnx \
  --punc-dir damo/punc_ct-transformer_cn-en-common-vocab471067-large-onnx \
  --lm-dir damo/speech_ngram_lm_zh-cn-ai-wesp-fst \
  --itn-dir thuduj12/fst_itn_zh \
  --hotword /workspace/models/hotwords.txt \
  --certfile 0

echo "=== FunASR 服务已启动，WebSocket 端口 10095 ==="

# 保持容器前台运行
tail -f /dev/null
