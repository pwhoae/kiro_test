extends Node2D

@export var enemy_scene:PackedScene
var time:float=0
var enemy_gen_points:Array[Marker2D]=[]
func _ready() -> void:
	var children=get_children()
	for child in children:
		var marker_2d=child as Marker2D
		enemy_gen_points.append(marker_2d)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	time+=delta
	if time>=1:
		time-=1
		var enemy=enemy_scene.instantiate() as Enemy
		var marker_2d=enemy_gen_points.pick_random() as Marker2D
		enemy.global_position=marker_2d.global_position
		enemy.show()
		get_parent().add_child(enemy)
	pass
