extends Node

signal window_status_update(message: String)

#region React Public API
func open_window(window_name: String) -> Window:
	window_status_update.emit("Window opened: " + window_name)
	var root = get_tree().root
	var window := Window.new()
	window.world_3d = World3D.new()
	var current_window = get_viewport().get_window()
	window.size = current_window.size
	window.content_scale_size = get_viewport().get_window().content_scale_size
	window.size.y *= float(window.content_scale_size.x)/float(window.size.x)
	window.size.y -= 90
	window.size.x = window.content_scale_size.x - 60
	window.position = current_window.position + Vector2i(30,60) # just for debugging
	window.content_scale_mode = Window.CONTENT_SCALE_MODE_CANVAS_ITEMS
	window.content_scale_aspect = Window.CONTENT_SCALE_ASPECT_EXPAND
	window.tree_exited.connect(func() -> void:
		window.queue_free() # In case it was removed from the tree but not with queue_free
	)
	window.close_requested.connect(func() -> void:
		window.queue_free()
	)
	window.name = window_name
	var scene: PackedScene = load("res://subwindow.tscn") # blocks if not loaded yet
	window.add_child(scene.instantiate())
	root.add_child(window)
	window.get_viewport().scaling_3d_scale = get_viewport().scaling_3d_scale
	return window


func close_window(window_name: String) -> bool:
	window_status_update.emit("Window closed: " + window_name)
	var root = get_tree().root
	var windows: Array[Node] = root.find_children("*", "Window", false, false)
	for window: Window in windows:
		if window.name == window_name:
			window.queue_free()
			return true
	return false
