extends Control

@onready var timer = $Timer
@onready var label = $Label
@onready var sprite = $AnimatedSprite2D
@onready var sfx_player = $SFXPlayer
@onready var bgm_player = $BGMPlayer

var focus_time = 25 * 60
var break_time = 5 * 60

#狀態定義
enum State {
	FOCUS,
	BREAK
}

var time_left = focus_time
var current_state = State.FOCUS
var is_running = false

func _ready():
	update_label()
	play_animation()

func _on_start_pressed():
	is_running = !is_running
	if is_running:
		timer.start()
	else:
		timer.stop()

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

#⏳ 時間顯示
func update_label():
	var m = time_left / 60
	var s = time_left % 60
	label.text = "%02d:%02d" % [m, s]
	
#2️⃣ 程式切換動畫
func play_animation():
	if current_state == State.FOCUS:
		sprite.play("focus")
	else:
		sprite.play("break")

func play_sfx(type):
	pass
