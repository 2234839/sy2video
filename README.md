# sy2video

从思源笔记转换为视频，需搭配 https://github.com/2234839/sy2video-plugin-siyuan 插件使用


## .env 文件示例

proxy_base 的 ip 是你运行此程序的电脑的 ip

```env
siyuan_token=************
siyuan_base=http://192.168.1.244:6806
proxy_base=http://192.168.1.12:6899
proxy_port=6899
```

## sy2videoConfig



在思源笔记的超级块中的第一个块添加 `custom-sy2video` 属性，属性值为 JSON 字符串，可以配置以下选项：
- `time`: 总播放时长，单位为秒。如果不设置，则默认为音频文件的时长，如果没有音频文件，则默认为 4 秒。

- `startTime`: 视频/音频开始播放的时间点，单位为秒。如果不设置，则从开头开始播放。
- `endTime`: 视频/音频结束播放的时间点，单位为秒。如果不设置，则播放到结尾。

