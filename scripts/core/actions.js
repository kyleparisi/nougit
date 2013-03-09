/*
 * Nougit - actions.js
 * Author : Gordon Hall
 */

nougit.actions = (function() {
	
	function renderRepositoryList(repos) {
		// compile view
		var repo_view = nougit.VIEWS['repo-list']({
			repos : repos
		});
		// render view
		$('#repositories').html(repo_view);
	};

	return {
		renderRepositoryList : renderRepositoryList
	};

})();