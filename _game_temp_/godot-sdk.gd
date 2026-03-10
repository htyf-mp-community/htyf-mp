extends Node
class_name RNInterface

## Godot 发往 RN 的请求：通过 ipcMain 发送 JSON 字符串，格式 { "id": "可选请求id", "type": "方法名", "payload": {} }
## RN 处理后会通过 emitToGodot 回传，本节点发出 ipcResponse 信号，格式 { "id", "type", "success": bool, "payload"?, "error"? }
signal ipcMain(message: String)
signal ipcResponse(message: String)

## RN 调用此方法传入一个 Callable，Godot 执行 c.call() 取得返回值（RN 的响应 JSON），并发出 ipcResponse 供业务层使用
func emitToGodot(c: Callable) -> void:
	var result: Variant = c.call()
	if result != null and str(result).length() > 0:
		ipcResponse.emit(str(result))

## 联调用：RN 侧 test_callable 会收到 Godot 传入的字符串并返回 123
func test_callable(c: Callable) -> void:
	var result: Variant = c.call("Hello from Godot")
	ipcMain.emit(JSON.stringify({
		"id": "test",
		"type": "test",
		"payload": { "greeting": "Hello from Godot", "result": result }
	}))

## 便捷方法：向 RN 发起 SDK 调用。type 为方法名，payload 为可选参数字典。
## 业务层连接 ipcResponse 信号，根据返回 JSON 的 id 或 type 匹配本次调用结果。
## 支持的 type 示例：openQR, showToast, showModal, getClipboardString, setClipboardString, openBrowser, getNetworkState, triggerHaptic 等；
## 也可以直接传 SDKFuncs 上的其它方法名，并通过 payload.args（数组）传参。
func call_rn(type: String, payload: Dictionary = {}) -> void:
	var id := str(Time.get_ticks_msec()) + "_" + str(randi())
	var msg := { "id": id, "type": type, "payload": payload }
	var json_str: String = JSON.stringify(msg)
	var base64 = Marshalls.raw_to_base64(json_str.to_utf8_buffer())
	ipcMain.emit(base64)

## 示例：打开扫码
func call_open_qr() -> void:
	call_rn("openQR", {})

## 示例：显示 Toast（type 可选：success | alert | error | loading）
func call_show_toast(title: String, description: String = "", toast_type: String = "success") -> void:
	call_rn("showToast", { "title": title, "description": description, "type": toast_type })

## 示例：显示弹窗
func call_show_modal(title: String, description: String, confirm_text: String = "确定", cancel_text: String = "取消") -> void:
	call_rn("showModal", { "title": title, "description": description, "confirmText": confirm_text, "cancelText": cancel_text })

## 示例：获取剪贴板
func call_get_clipboard() -> void:
	call_rn("getClipboardString", {})

## 示例：设置剪贴板
func call_set_clipboard(text: String) -> void:
	call_rn("setClipboardString", { "text": text })

## 示例：打开浏览器
func call_open_browser(url: String) -> void:
	call_rn("openBrowser", { "url": url })

## 示例：获取网络状态
func call_get_network_state() -> void:
	call_rn("getNetworkState", {})

## 示例：触觉反馈
func call_trigger_haptic(haptic_type: String = "impactMedium") -> void:
	call_rn("triggerHaptic", { "type": haptic_type })
