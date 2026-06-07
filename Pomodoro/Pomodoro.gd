extends Control

@export var label:Label
@export var timer :Timer
@export var sprite :AnimatedSprite2D
@export var mins :SpinBox

#@onready var label = $HBoxContainer/Label
#@onready var timer = $"../Timer" 
#@onready var sprite = $"../AnimatedSprite2D"

#@onready var sfx_player = $SFXPlayer
#@onready var bgm_player = $BGMPlayer

#狀態定義
enum State {
	FOCUS,#25 mins
	BREAK #5 mins
}
#時間
var focus_time = 25 * 60
var break_time = 5 * 60
var time_left = focus_time
var current_state = State.FOCUS
var is_running = false

func _ready():
	sprite.hide()
	timer.wait_time=1.0# 設定 Timer 每 1 秒觸發一次
	timer.one_shot=true
	timer.timeout.connect(_on_Timer_timeout)
	print(mins.value)
	

	update_label()
	play_animation()

func _physics_process(delta: float) -> void:
	play_animation()
	
#⏳ 時間顯示更新
func update_label():
	var m = time_left / 60
	var s = time_left % 60
	label.text = "%02d:%02d" % [m, s]
	
#程式切換動畫
func play_animation():
	if current_state == State.FOCUS:
		sprite.show()
		sprite.play("focus")
	else:
		sprite.hide()
		
func _on_run_pressed() -> void:
	print(mins.value)
	timer.one_shot=false
	if current_state==State.FOCUS:
		current_state = State.BREAK
		timer.stop()
	else:
		current_state = State.FOCUS
		timer.start()

func _on_reset_pressed():
	is_running = false
	timer.stop()
	current_state = State.FOCUS
	time_left = focus_time
	update_label()
	play_animation()

func _on_Timer_timeout():
	time_left -= 1
	update_label()

	if time_left <= 0:
		switch_state()

func switch_state():
	if current_state == State.FOCUS:
		current_state = State.BREAK
		time_left = break_time
		#play_sfx("break")
	else:
		current_state = State.FOCUS
		time_left = focus_time
		#play_sfx("focus")

	play_animation()


	


func play_sfx(type):
	pass
