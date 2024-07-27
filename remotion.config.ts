/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import {Config} from '@remotion/cli/config';
import {webpackOverride} from './src/webpack-override';
import { cpus } from "os";
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

Config.overrideWebpackConfig(webpackOverride);

Config.setChromiumHeadlessMode(false)
Config.setBrowserExecutable("C:/Users/llej/AppData/Local/Thorium/Application/thorium.exe")
Config.setChromiumDisableWebSecurity(true)
Config.setChromiumIgnoreCertificateErrors(true)

// 关闭并发渲染，并发渲染虽然快，但 Remotion 的实现有问题，iframe 的形式来引入块会导致画面闪烁
// Config.setConcurrency(1);
// 默认设置
//   Rendering frames     ━━━━━━━━━━━━━━━━━━ 720/720
// │ Rendered frames      ━━━━━━━━━━━━━━━━━━ 41060ms[req.url] /api/system/setUILayout
// │ Encoding video       ━━━━━━━━━━━━━╺━━━━ 522/720[req.url] /ws?app=9qny&id=b512fc80-e204-47dd-9cac-13d69da28833&type=main
// │ Encoded video        ━━━━━━━━━━━━━━━━━━ 1045ms

// Config.setConcurrency(cpus().length);
// │ Rendered frames      ━━━━━━━━━━━━━━━━━━ 42917ms626202557-mnxf59l.wav
//                                                  [req.url] /assets/20240626-1217-58.9070625-20240626201830-n40fq94.mp4
// │ Encoded video        ━━━━━━━━━━━━━━━━━━ 1217ms
// │ ○                    out/Article.mp4 3 MB

// 渲染完成时，Remotion Studio 选项卡是否应发出蜂鸣声
Config.setBeepOnFinish(true);
// 44941 1019
// 106179