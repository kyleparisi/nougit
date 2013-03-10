/*
 * Nougit - bindings.js
 * Author : Gordon Hall
 */

$('#add_existing_repo').bind('click', function() {
	$('#existing_repo').trigger('click');
});

$('#existing_repo').change(function() {
	$('#confirm_existing_repo').modal();
});