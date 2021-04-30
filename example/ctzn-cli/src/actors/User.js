export default function* UserActor({ parent, dispatch, self, log, state = {} }, userId) {
	const [, homeserver] = userId.split("@");

	if (Object.keys(state.communities || {}).length === 0) {
		dispatch(self, { type: "REFRESH_COMMUNITY_MEMBERSHIPS" });
	}

	if (Object.keys(state.following || {}).length === 0) {
		dispatch(self, { type: "REFRESH_FOLLOWING" });
	}

	if (Object.keys(state.posts || {}).length === 0) {
		dispatch(self, { type: "REFRESH_POSTS" });
	}

	running: while (true) {
		const msg = yield state;
		switch (msg.type) {
			case "REFRESH": {
				dispatch(self, { type: "REFRESH_POSTS" });
				dispatch(self, { type: "REFRESH_FOLLOWING" });
				dispatch(self, { type: "REFRESH_COMMUNITY_MEMBERSHIPS" });
				break;
			}

			case "DIE": {
				break running;
			}

			case "REFRESH_COMMUNITY_MEMBERSHIPS": {
				dispatch(`ctzn://${homeserver}`, {
					type: "REQUEST_USER_COMMUNITY_MEMBERSHIPS",
					method: "table.list",
					params: [userId, "ctzn.network/community-membership"],
				});
				break;
			}

			case "RESPOND_USER_COMMUNITY_MEMBERSHIPS": {
				for (const { key } of msg.result?.entries ?? []) {
					dispatch(parent, { type: "REPORT_FOUND_COMMUNITY", communityId: key });
				}
				state.communities = [
					...new Set([
						...(state.communities || []),
						...(msg.result?.entries ?? []).map((ent) => ent.key),
					]),
				];
				break;
			}

			case "REFRESH_FOLLOWING": {
				dispatch(`ctzn://${homeserver}`, {
					type: "REQUEST_USER_FOLLOWING",
					method: "table.list",
					params: [userId, "ctzn.network/follow"],
				});
				break;
			}

			case "RESPOND_USER_FOLLOWING": {
				for (const { key } of msg.result?.entries ?? []) {
					dispatch(parent, { type: "REPORT_FOUND_USER", userId: key });
				}
				state.following = [
					...new Set([
						...(state.following || []),
						...(msg.result?.entries ?? []).map((ent) => ent.key),
					]),
				];
				break;
			}

			case "REFRESH_POSTS": {
				dispatch(`ctzn://${homeserver}`, {
					type: "REQUEST_USER_POSTS",
					method: "view.get",
					params: ["ctzn.network/posts-view", userId, { limit: 15, reverse: true }],
				});
				break;
			}

			case "RESPOND_USER_POSTS": {
				state.posts = {
					...state.posts,
					...(msg.result?.posts ?? []).reduce(
						(acc, post) => ({
							...acc,
							[post.key]: post,
						}),
						{},
					),
				};
				break;
			}

			default: {
				//log(msg);
				break;
			}
		}
	}
}
