extends Node2D

func _process(_delta: float) -> void:
	var selected_carousel_node = $CarouselContainer.position_offset_node.get_child($CarouselContainer.selected_index)


func _on_left_pressed() -> void:
	$CarouselContainer._left()
	pass # Replace with function body.


func _on_right_pressed() -> void:
	$CarouselContainer._right()

	pass # Replace with function body.
