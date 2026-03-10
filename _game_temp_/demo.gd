extends CanvasLayer

## RNInterface API 演示：为每个接口提供按钮，并显示 ipcResponse 返回结果

var _rn: RNInterface
var _result_dialog: AcceptDialog

func _ready() -> void:
	_rn = get_parent().get_node("RNInterface") as RNInterface
	if _rn == null:
		push_error("Demo: RNInterface 节点未找到")
		return

	_result_dialog = AcceptDialog.new()
	_result_dialog.title = "RN 返回"
	add_child(_result_dialog)

	_rn.ipcResponse.connect(_on_ipc_response)

	var margin := MarginContainer.new()
	margin.set_anchors_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 20)
	margin.add_theme_constant_override("margin_right", 20)
	margin.add_theme_constant_override("margin_top", 20)
	margin.add_theme_constant_override("margin_bottom", 20)
	add_child(margin)

	var scroll := ScrollContainer.new()
	scroll.set_h_size_flags(Control.SIZE_EXPAND_FILL)
	scroll.set_v_size_flags(Control.SIZE_EXPAND_FILL)
	margin.add_child(scroll)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 10)
	scroll.add_child(vbox)

	var title := Label.new()
	title.text = "RNInterface API Demo"
	title.add_theme_font_size_override("font_size", 20)
	vbox.add_child(title)

	vbox.add_child(_make_button("1. Test Callable (需 RN 注册回调)", _on_test_callable))
	vbox.add_child(_make_button("2. 打开扫码 (openQR)", _on_open_qr))
	vbox.add_child(_make_button("3. 显示 Toast - info", func(): _rn.call_show_toast("标题", "这是描述", "info")))
	vbox.add_child(_make_button("4. 显示 Toast - success", func(): _rn.call_show_toast("成功", "操作完成", "success")))
	vbox.add_child(_make_button("5. 显示弹窗", _on_show_modal))
	vbox.add_child(_make_button("6. 获取剪贴板", _on_get_clipboard))
	vbox.add_child(_make_button("7. 设置剪贴板", _on_set_clipboard))
	vbox.add_child(_make_button("8. 打开浏览器", _on_open_browser))
	vbox.add_child(_make_button("9. 获取网络状态", _on_get_network_state))
	vbox.add_child(_make_button("10. 触觉反馈 - impactMedium", func(): _rn.call_trigger_haptic("impactMedium")))
	vbox.add_child(_make_button("11. 触觉反馈 - notificationSuccess", func(): _rn.call_trigger_haptic("notificationSuccess")))

func _make_button(text: String, callback: Callable) -> Button:
	var btn := Button.new()
	btn.text = text
	btn.pressed.connect(callback)
	return btn

func _on_ipc_response(message: String) -> void:
	_result_dialog.dialog_text = message
	_result_dialog.popup_centered()

func _on_test_callable() -> void:
	# 仅演示：实际需 RN 侧先通过 emitToGodot 注册 Callable，此处仅发请求
	_rn.call_rn("test", { "greeting": "Hello from Godot" })

func _on_open_qr() -> void:
	_rn.call_open_qr()

func _on_show_modal() -> void:
	_rn.call_show_modal("演示弹窗", "这是 Godot 通过 RNInterface 调起的弹窗", "确定", "取消")

func _on_get_clipboard() -> void:
	_rn.call_get_clipboard()

func _on_set_clipboard() -> void:
	_rn.call_set_clipboard("来自 Godot 的剪贴板内容")

func _on_open_browser() -> void:
	_rn.call_open_browser("https://godotengine.org")

func _on_get_network_state() -> void:
	_rn.call_get_network_state()
