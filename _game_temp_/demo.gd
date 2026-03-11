extends CanvasLayer

## RNInterface API 演示：苹果设置风格 UI，分组列表 + 圆角卡片

var _rn: RNInterface
var _result_dialog: AcceptDialog

# 苹果风格颜色（浅色）
const BG_GROUP := Color(0.95, 0.95, 0.97)      # #F2F2F7
const BG_ROW := Color(1.0, 1.0, 1.0)           # 白
const FG_TITLE := Color(0.0, 0.0, 0.0)         # 标题黑
const FG_HEADER := Color(0.56, 0.56, 0.58)      # 分组标题灰 #8E8E93
const FG_ROW := Color(0.0, 0.0, 0.0)
const BORDER_ROW := Color(0.78, 0.78, 0.8)     # 分隔线 #C6C6C8
const CORNER_RADIUS := 10
const HORZ_MARGIN := 20
const SECTION_SPACING := 24
const ROW_PADDING := 14

func _ready() -> void:
	_rn = get_parent().get_node("RNInterface") as RNInterface
	if _rn == null:
		push_error("Demo: RNInterface 节点未找到")
		return

	_result_dialog = AcceptDialog.new()
	_result_dialog.title = "RN 返回"
	add_child(_result_dialog)

	_rn.ipcResponse.connect(_on_ipc_response)

	# 根：全屏边距
	var root_margin := MarginContainer.new()
	root_margin.set_anchors_preset(Control.PRESET_FULL_RECT)
	root_margin.add_theme_constant_override("margin_left", HORZ_MARGIN)
	root_margin.add_theme_constant_override("margin_right", HORZ_MARGIN)
	root_margin.add_theme_constant_override("margin_top", 16)
	root_margin.add_theme_constant_override("margin_bottom", 24)
	add_child(root_margin)

	# 背景色（苹果设置灰）
	var bg := ColorRect.new()
	bg.color = BG_GROUP
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root_margin.add_child(bg)

	var scroll := ScrollContainer.new()
	scroll.set_anchors_preset(Control.PRESET_FULL_RECT)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	root_margin.add_child(scroll)

	var main := VBoxContainer.new()
	main.add_theme_constant_override("separation", SECTION_SPACING)
	scroll.add_child(main)

	# 标题区
	var title_label := Label.new()
	title_label.text = "RNInterface"
	title_label.add_theme_font_size_override("font_size", 34)
	title_label.add_theme_color_override("font_color", FG_TITLE)
	main.add_child(title_label)

	var subtitle := Label.new()
	subtitle.text = "API 演示"
	subtitle.add_theme_font_size_override("font_size", 15)
	subtitle.add_theme_color_override("font_color", FG_HEADER)
	main.add_child(subtitle)

	# 分组：通信与扫码
	main.add_child(_section_header("通信与扫码"))
	main.add_child(_make_group([
		["Test Callable", "需 RN 注册回调", _on_test_callable],
		["打开扫码", "openQR", _on_open_qr],
	]))

	# 分组：Toast
	main.add_child(_section_header("Toast"))
	main.add_child(_make_group([
		["Toast - 信息", "info", func(): _rn.call_show_toast("标题", "这是描述", "info")],
		["Toast - 成功", "success", func(): _rn.call_show_toast("成功", "操作完成", "success")],
	]))

	# 分组：弹窗与剪贴板
	main.add_child(_section_header("弹窗与剪贴板"))
	main.add_child(_make_group([
		["显示弹窗", "Modal", _on_show_modal],
		["获取剪贴板", "", _on_get_clipboard],
		["设置剪贴板", "", _on_set_clipboard],
	]))

	# 分组：系统
	main.add_child(_section_header("系统"))
	main.add_child(_make_group([
		["打开浏览器", "godotengine.org", _on_open_browser],
		["网络状态", "", _on_get_network_state],
	]))

	# 分组：触觉反馈
	main.add_child(_section_header("触觉反馈"))
	main.add_child(_make_group([
		["impactMedium", "", func(): _rn.call_trigger_haptic("impactMedium")],
		["notificationSuccess", "", func(): _rn.call_trigger_haptic("notificationSuccess")],
	]))

func _section_header(text: String) -> Control:
	var h := Label.new()
	h.text = text
	h.add_theme_font_size_override("font_size", 13)
	h.add_theme_color_override("font_color", FG_HEADER)
	h.add_theme_constant_override("margin_left", 4)
	h.add_theme_constant_override("margin_top", 8)
	return h

func _make_group(rows: Array) -> PanelContainer:
	var panel := PanelContainer.new()
	var style := StyleBoxFlat.new()
	style.bg_color = BG_ROW
	style.set_corner_radius_all(CORNER_RADIUS)
	style.set_border_width_all(0)
	panel.add_theme_stylebox_override("panel", style)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 0)
	panel.add_child(vbox)

	for i in rows.size():
		var r: Array = rows[i]
		var title_text: String = r[0]
		var subtitle_text: String = r[1]
		var callback: Callable = r[2]
		var is_last := i == rows.size() - 1
		vbox.add_child(_make_row(title_text, subtitle_text, callback, is_last))

	return panel

func _make_row(title: String, subtitle: String, callback: Callable, is_last: bool) -> Control:
	var row := HBoxContainer.new()
	row.mouse_filter = Control.MOUSE_FILTER_PASS

	var btn := Button.new()
	btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
	btn.flat = true
	btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	btn.text = "  " + title
	btn.pressed.connect(callback)

	var normal := StyleBoxFlat.new()
	normal.bg_color = Color(1, 1, 1, 0)
	normal.set_corner_radius_all(0)
	normal.set_content_margin_all(ROW_PADDING)
	if not is_last:
		normal.border_width_bottom = 1
		normal.border_color = BORDER_ROW
	btn.add_theme_stylebox_override("normal", normal)

	var hover := StyleBoxFlat.new()
	hover.bg_color = Color(0.95, 0.95, 0.97, 0.6)
	hover.set_corner_radius_all(0)
	hover.set_content_margin_all(ROW_PADDING)
	if not is_last:
		hover.border_width_bottom = 1
		hover.border_color = BORDER_ROW
	btn.add_theme_stylebox_override("hover", hover)

	var pressed := StyleBoxFlat.new()
	pressed.bg_color = Color(0.9, 0.9, 0.92, 0.8)
	pressed.set_corner_radius_all(0)
	pressed.set_content_margin_all(ROW_PADDING)
	if not is_last:
		pressed.border_width_bottom = 1
		pressed.border_color = BORDER_ROW
	btn.add_theme_stylebox_override("pressed", pressed)

	btn.add_theme_font_size_override("font_size", 17)
	btn.add_theme_color_override("font_color", FG_ROW)
	btn.add_theme_color_override("font_hover_color", FG_ROW)
	btn.add_theme_color_override("font_pressed_color", FG_ROW)
	row.add_child(btn)

	if not subtitle.is_empty():
		var right_label := Label.new()
		right_label.text = subtitle
		right_label.add_theme_font_size_override("font_size", 17)
		right_label.add_theme_color_override("font_color", FG_HEADER)
		right_label.size_flags_horizontal = Control.SIZE_SHRINK_END
		row.add_child(right_label)

	return row

func _on_ipc_response(message: String) -> void:
	_result_dialog.dialog_text = message
	_result_dialog.popup_centered()

func _on_test_callable() -> void:
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
