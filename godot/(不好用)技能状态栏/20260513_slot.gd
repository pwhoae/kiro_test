extends Panel

@onready var texture_button: TextureButton = $TextureButton
@onready var texture_progress_bar: TextureProgressBar = $TextureProgressBar
@onready var label:Label=$TextureProgressBar/Label
@export var status: Resource
var left_time: float = 1.0

var tween: Tween


func _physics_process(delta: float) -> void:
	if texture_progress_bar.visible:
		label.text = "%.02f" % left_time
	else:
		label.text = ""


func bind_skill(_status):
	status = _status
	texture_button.texture_normal = status.skill_icon


func use_skill():
	print("pressed")
	if not status:
		print("未綁定技能")
		return "未綁定技能"
	elif texture_progress_bar.visible:
		return "技能冷卻中"
	left_time = status.cool_down
	texture_progress_bar.max_value=left_time
	texture_progress_bar.value=left_time
	texture_progress_bar.visible = true

	if tween:
		tween.kill()
	tween = create_tween()
	tween.tween_property(texture_progress_bar, "value", 0.0, left_time)
	tween.parallel().tween_property(self, "left_time", 0.0, left_time)
	tween.tween_callback(func():
		texture_progress_bar.visible = false
	)
	pass

func _on_texture_button_pressed() -> void:
	use_skill() 
