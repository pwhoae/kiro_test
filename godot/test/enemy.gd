extends CharacterBody2D
class_name Enemy
@onready var player:CharacterBody2D=$"../Player"
func _ready():
	input_pickable = true 
	
func _physics_process(delta: float) -> void:
	var direction_to_player=position.direction_to(player.position)
	velocity=direction_to_player*10
	move_and_slide()


func _on_mouse_entered() -> void:
	queue_free()
	pass # Replace with function body.
