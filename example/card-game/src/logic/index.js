import "babel-core/register";
import "babel-polyfill";

import system from "./system";
import Root from "./actors/Root";

system.register(Root);
system.spawn.root(Root);
