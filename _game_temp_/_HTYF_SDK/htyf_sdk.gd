extends Node
class_name _HtyfSdk

## Godot 发往 RN 的请求：通过 ipcMain 发送 JSON 字符串，格式 { "id": "可选请求id", "type": "方法名", "payload": {} }
## RN 处理后会通过 emitToGodot 回传，本节点发出 ipcResponse 信号，格式 { "id", "type", "success": bool, "payload"?, "error"? }
signal ipcMain(message: String)
signal ipcResponse(message: String)

var _pending_callbacks: Dictionary = {}
var _ipc_response_connected: bool = false
var _isReady: bool = false
var _is_dev_mode: bool = false
var _menu_button_bounding_client_rect: Dictionary = {
	"top" = 0,
	"right" = 0,
	"bottom" = 0,
	"left" = 0,
	"width" = 0,
	"height" = 0
}

func set_dev_mode(is_dev_mode: bool) -> void:
	_is_dev_mode = is_dev_mode

# 示例：log("message", "debug")
## level 可选：debug | log | warn | error
func log(message: Variant, level: String = "log") -> void:
	var message_str: String = ""
	if typeof(message) == TYPE_DICTIONARY or typeof(message) == TYPE_ARRAY:
		message_str = JSON.stringify(message)
	else:
		message_str = str(message)
	print("__log[ " + level + " ]: " + message_str)
	call_rn("__log", { "message": message_str, "level": level })

func _ready() -> void:
	_isReady = false
	# 只连接一次：让所有 call_rn 都能通过 id 匹配回调
	if _ipc_response_connected:
		return
	_ipc_response_connected = true
	ipcResponse.connect(_on_ipc_response)
	call_rn("isReady", {}, func(data: Dictionary):
		call_show_modal("success", "isReady result: " + JSON.stringify(data))
		_isReady = data.get("payload", false)
	)
	call_rn("getMenuButtonBoundingClientRect", {}, func(_data: Dictionary):
		pass
	)

func _on_ipc_response(message: String) -> void:
	# message 是 RN 回传的 JSON 字符串
	var json := JSON.new()
	var err := json.parse(message)
	if err != OK:
		if _is_dev_mode:
			call_show_modal("error", "parse json error: " + message)
		return
	var data: Dictionary = json.get_data()
	if typeof(data) != TYPE_DICTIONARY:
		if _is_dev_mode:
			call_show_modal("error", "data is not a dictionary: " + message)	
		return
	var id: String = str(data.get("id", ""))
	if id == "":
		if _is_dev_mode:
			call_show_modal("error", "id is empty: " + message)
		return
	if !_pending_callbacks.has(id):
		return
	var cb: Callable = _pending_callbacks[id]
	_pending_callbacks.erase(id)
	if cb.is_valid():
		cb.call(data)

## RN 调用此方法传入一个 Callable，Godot 执行 c.call() 取得返回值（RN 的响应 JSON），并发出 ipcResponse 供业务层使用
func emitToGodot(c: Callable) -> void:
	var result: Variant = c.call()
	if result != null and str(result).length() > 0:
		ipcResponse.emit(str(result))
		

## 便捷方法：向 RN 发起 SDK 调用。type 为方法名，payload 为可选参数字典。
## 业务层连接 ipcResponse 信号，根据返回 JSON 的 id 或 type 匹配本次调用结果。
## 支持的 type 示例：openQR, showToast, showModal, getClipboardString, setClipboardString, openBrowser, getNetworkState, triggerHaptic 等；
## 也可以直接传 SDKFuncs 上的其它方法名，并通过 payload.args（数组）传参。
func call_rn(type: String, payload: Dictionary = {}, on_result: Callable = Callable()) -> String:
	var id := str(type + "_" + str(Time.get_ticks_msec()) + "_" + str(randi()))
	var msg := { "id": id, "type": type, "payload": payload }
	var json_str: String = JSON.stringify(msg)
	var base64 = Marshalls.raw_to_base64(json_str.to_utf8_buffer())

	# 注册回调（支持并发）：等 RN 回传带相同 id 的 ipcResponse
	if on_result.is_valid():
		_pending_callbacks[id] = on_result

	ipcMain.emit(base64)
	return id

## 示例：打开扫码
## on_result 回调签名约定：func _cb(result: String) -> void
func call_open_qr(on_result: Callable = Callable()) -> void:
	call_rn(
		"openQR",
		{},
		func (data: Dictionary):
			if data.get("success", false) == true:
				var result: String = data.get("payload").get("data", "")
				on_result.call(result)
			# 失败时也把 error 透传出去，避免 Godot 侧“无回调”
			else:
				var error: String = data.get("error", "")
				on_result.call(error)
	)

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

## 示例：关闭应用
func call_close_app() -> void:
	call_rn("closeApp", {})

## 示例：获取菜单按钮边界矩形
## on_result 回调签名约定：func _cb(result: Dictionary) -> void
func call_get_menu_button_bounding_client_rect(on_result: Callable = Callable()) -> void:
	on_result.call(_menu_button_bounding_client_rect)
	call_rn(
		"getMenuButtonBoundingClientRect",
		{},
		func (data: Dictionary):
			if data.get("success", false) == true:
				var result: Dictionary = data.get("payload", {})
				var rect: Dictionary = {
					"top": result.get("top", 0),
					"right": result.get("right", 0),
					"bottom": result.get("bottom", 0),
					"left": result.get("left", 0),
					"width": result.get("width", 0),
					"height": result.get("height", 0)
				}
				_menu_button_bounding_client_rect = rect
				if on_result.is_valid():
					on_result.call(_menu_button_bounding_client_rect)
			else:
				if on_result.is_valid():
					on_result.call({ "top": 0, "right": 0, "bottom": 0, "left": 0, "width": 0, "height": 0 })
	)
	
