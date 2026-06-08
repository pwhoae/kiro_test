extends TextureButton
@export var anim :AnimatedSprite2D
@export var label :RichTextLabel
@export var speed_button:TextureButton

var speed_levels = [1.0, 2.0, 4.0, 8.0, 16.0]# 速度数组
var current_index = 0
var tween: Tween

func _ready():
	#speed_button.pressed.connect(_on_pressed)
	update_ui()

func _on_pressed() -> void:
	current_index = (current_index + 1) % speed_levels.size()
	var target_speed = speed_levels[current_index]
	# 2. 平滑过渡到新速度
	#if tween: tween.kill()
	#tween = create_tween()
	#tween.tween_property(anim, "speed_scale", target_speed, 0.3)
	update_ui()

func update_ui():
	var current_speed = speed_levels[current_index]
	label.text = "X " + str(current_speed) 
