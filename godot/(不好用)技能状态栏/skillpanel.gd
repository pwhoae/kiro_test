
extends Control

@onready var grid_container: GridContainer = $GridContainer

func bind_skill(_index, _status):
	if grid_container.get_child_count() > _index:
		var slot = grid_container.get_child(_index)
		slot.bind_skill(_status)

func use_skill(_index) -> String:
	if grid_container.get_child_count() > _index:
		var slot = grid_container.get_child(_index)
		return slot.use_skill()
	return "技能施放失敗"
