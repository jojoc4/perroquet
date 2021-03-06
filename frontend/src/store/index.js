import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'


Vue.use(Vuex)

const BASE_URL = process.env.VUE_APP_BASEURL

//to handle state
const state = {
    token: "",
    profiles: [],
    filter: "new",
    userId: 0,
    messages: [],
    message: {
        "id": 0,
        "reply_count": 0,
        "like_count": 0,
        "liked": false,
        "content": "",
        "image": null,
        "user": {
            "id": 0,
            "username": "",
            "profile": {
                "image": null
            },
        },
        "replyTo": null,
    },
    nextMessages: null,
    darkMode: false
}

//to handle state
const getters = {
    authenticated: state => {
        return state.token !== ""
    },
}

//to handle actions
const actions = {
    login({commit}, fields) {
        return new Promise((resolve, reject) => {
            axios.post(BASE_URL + 'token/',
                {
                    username: fields.username,
                    password: fields.password,
                }).then((response) => {
                axios.defaults.headers.common = {
                    "Authorization": 'Token ' + response.data.token
                };
                commit('LOGIN', response.data.token);
                axios.get(BASE_URL + "users/me/").then((response) => {
                    commit('SETID', response.data.id);
                    resolve();
                }, (error) => {
                    reject(error);
                })
            }, (error) => {
                reject(error);
            });
        });
    },
    logout({commit}) {
        commit('LOGOUT');
    },
    register({commit}, fields) {
        return new Promise((resolve, reject) => {
            axios.post(BASE_URL + 'register/',
                {
                    username: fields.username,
                    password: fields.password,
                    password2: fields.password2,
                    email: fields.email,
                    first_name: fields.firstname,
                    last_name: fields.lastname
                }).then(() => {
                axios.post(BASE_URL + 'token/',
                    {
                        username: fields.username,
                        password: fields.password,
                    }).then((response) => {
                    commit('LOGIN', response.data.token);
                    axios.defaults.headers.common = {
                        "Authorization": 'Token ' + response.data.token
                    };
                    axios.get(BASE_URL + "users/me/").then((response) => {
                        commit('SETID', response.data.id);
                        resolve();
                    }, (error) => {
                        reject(error);
                    })
                }, (error) => {
                    reject(error);
                });
            }, (error) => {
                reject(error);
            });

        });
    },
    getProfile({commit}, id) {
        return new Promise((resolve, reject) => {
            if (state.profiles[id] !== undefined) {
                resolve(state.profiles[id]);
            } else {
                axios.get(BASE_URL + "users/" + id + "/").then((response) => {
                    commit('ADDPROFILE', response.data);
                    resolve(state.profiles[id]);
                }, (error) => {
                    reject(error);
                })
            }
        });
    },
    saveProfile({commit}, profile) {
        return new Promise((resolve, reject) => {
            axios.put(BASE_URL + "users/" + profile.id + "/", profile.data, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            ).then((response) => {
                commit('ADDPROFILE', response.data);
                resolve();
            }, (error) => {
                reject(error);
            })
        });
    },
    // eslint-disable-next-line no-unused-vars
    changePassword({commit}, password) {
        return new Promise((resolve, reject) => {
            axios.put(BASE_URL + "change_password/" + password.id + "/", {
                password: password.new,
                password2: password.new2,
                old_password: password.old
            }).then(() => {
                resolve();
            }, () => {
                reject();
            })
        })
    },
    // eslint-disable-next-line no-unused-vars
    addMessage({commit}, message) {
        return new Promise((resolve, reject) => {
            axios.post(BASE_URL + "messages/", message, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            ).then(() => {
                resolve();
            }, (error) => {
                reject(error);
            })
        });
    },
    async getMessageComments({commit}, id,next) {
        try {
            if (next && this.state.nextMessages) {
                const response = await axios.get(this.state.nextMessages)
                commit('NEXTMESSAGES', response.data.next)
                commit('LOADNEXTMESSAGES', response.data.results)
            }
            else if (!next) {
                const response = await axios.get(BASE_URL + "messages/" + id + "/comments/" + state.filter + "/")
            commit('NEXTMESSAGES', response.data.next)
            commit('MESSAGES', response.data.results)
            const message = await axios.get(BASE_URL + "messages/" + id + "/")
            commit('MESSAGEDETAIL', message.data)
            }
        } catch (error) {
            console.log(error)
        }
    },
    getProfileMessages({commit}, id) {
        return new Promise((resolve, reject) => {
            axios.get(BASE_URL + "users/" + id + "/messages/" + state.filter + "/").then((response) => {
                // eslint-disable-next-line no-unused-vars
                for (var m in response.data.results) {
                    commit('ADDMESSAGESTOPROFILE', {m: response.data, id: id});
                    resolve(state.profiles[id].messages);
                    break;
                }
                resolve([])
            }, (error) => {
                reject(error);
            })
        });
    },
    passwordResetLink({commit}, fields) {
        return new Promise((resolve, reject) => {
            axios.post(BASE_URL + "password_reset/", {email: fields.email}).then(() => {
                commit('LOGOUT');
                resolve();
            }, (error) => {
                reject(error);
            })
        });
    },
    passwordReset({commit}, fields) {
        return new Promise((resolve, reject) => {
            axios.post(BASE_URL + "password_reset/confirm/", fields).then(() => {
                commit('LOGOUT');
                resolve();
            }, (error) => {
                reject(error);
            })
        });
    },
    filter({commit}, filter) {
        commit('FILTER', filter);
    },
    async requestDiscover({commit},next) {
        try {
            if (next && this.state.nextMessages) {
                const response = await axios.get(this.state.nextMessages)
                commit('NEXTMESSAGES', response.data.next)
                commit('LOADNEXTMESSAGES', response.data.results)
            }
            else if (!next) {
                const response = await axios.get(BASE_URL + "messages/discover/" + state.filter + "/")
                commit('NEXTMESSAGES', response.data.next)
                commit('MESSAGES', response.data.results)
            }

        } catch (error) {
            console.log(error)
        }
    },
    async requestHome({commit},next) {
        try {
            if (next && this.state.nextMessages) {
                const response = await axios.get(this.state.nextMessages)
                commit('NEXTMESSAGES', response.data.next)
                commit('LOADNEXTMESSAGES', response.data.results)
            }
            else if (!next) {
                const response = await axios.get(BASE_URL + "messages/home/" + state.filter + "/")
                commit('NEXTMESSAGES', response.data.next)
                commit('MESSAGES', response.data.results)
            }
        } catch (error) {
            console.log(error)
        }
    },
    async requestFriends({commit},next) {
        try {
            if (next && this.state.nextMessages) {
                const response = await axios.get(this.state.nextMessages)
                commit('NEXTMESSAGES', response.data.next)
                commit('LOADNEXTMESSAGES', response.data.results)
            }
            else if (!next) {
                const response = await axios.get(BASE_URL + "messages/friends/" + state.filter + "/")
                commit('NEXTMESSAGES', response.data.next)
                commit('MESSAGES', response.data.results)
            }
        } catch (error) {
            console.log(error)
        }
    },
    // eslint-disable-next-line no-unused-vars
    addLike({commit}, messageId) {
        return new Promise((resolve, reject) => {
            axios.post(BASE_URL + "likes/", {message_id: messageId}).then(() => {
                resolve();
            }, (error) => {
                reject(error);
            })
        });
    },
    // eslint-disable-next-line no-unused-vars
    removeLike({commit}, messageId) {
        return new Promise((resolve, reject) => {
            axios.delete(BASE_URL + "likes/" + messageId + "/").then(() => {
                resolve();
            }, (error) => {
                reject(error);
            })
        });
    },
    // eslint-disable-next-line no-unused-vars
    getFollow({commit}, userId) {
        return new Promise((resolve, reject) => {
            axios.get(BASE_URL + "users/" + userId + "/follows/").then((response) => {
                resolve(response.data.results);
            }, (error) => {
                reject(error);
            })
        });
    },
    // eslint-disable-next-line no-unused-vars
    getFollower({commit}, userId) {
        return new Promise((resolve, reject) => {
            axios.get(BASE_URL + "users/" + userId + "/followers/").then((response) => {
                resolve(response.data.results);
            }, (error) => {
                reject(error);
            })
        });
    },
    // eslint-disable-next-line no-unused-vars
    follow({commit}, following_id) {
        return new Promise((resolve, reject) => {
            axios.post(BASE_URL + "follows/", {following_id: following_id}).then(() => {
                resolve();
            }, (error) => {
                reject(error);
            })
        });
    },
    // eslint-disable-next-line no-unused-vars
    unfollow({commit}, followed) {
        return new Promise((resolve, reject) => {
            axios.delete(BASE_URL + "follows/" + followed + "/").then(() => {
                resolve();
            }, (error) => {
                reject(error);
            })
        });
    },
    toogleTheme({commit}, dark) {
        commit("TOOGLETHEME", dark)
    }
}

//to handle mutations
const mutations = {
    LOGIN(state, token) {
        state.token = token;
        localStorage.setItem("token", token);
    },
    LOGOUT(state) {
        state.token = "";
        localStorage.setItem("token", "");
        axios.defaults.headers.common = {
            "Authorization": ""
        };
        localStorage.setItem("userId", 0);
        state.userId = 0;
    },
    initialiseStore(state) {
        if (localStorage.getItem('token') != null) {
            state.token = localStorage.getItem('token');
            if (state.token != "") {
                axios.defaults.headers.common = {
                    "Authorization": 'Token ' + state.token
                };
            }
            state.userId = localStorage.getItem("userId")
        }
        if(localStorage.getItem('darkMode') != null){
            state.darkMode = JSON.parse(localStorage.getItem('darkMode'))
        }
    },
    ADDPROFILE(state, profile) {
        state.profiles[profile.id] = profile;
    },
    ADDMESSAGESTOPROFILE(state, {m, id}) {
        state.profiles[id].messages = m.results;
    },
    FILTER(state, filter) {
        state.filter = filter;
        state.nextMessages = null;
        state.messages=[];
    },
    MESSAGES(state, messages) {
        state.messages = messages;
        // state.messages = state.messages.concat(messages);
        // console.log(state.messages)
    },
    MESSAGEDETAIL(state, message) {
        state.message = message;
    },
    NEXTMESSAGES(state, nextUrl) {
        if (nextUrl == null)
        {
            state.nextMessages=null;
        }
        else
        {
            state.nextMessages = nextUrl;
        }

    },
    LOADNEXTMESSAGES(state, messages) {
        state.messages = state.messages.concat(messages);
    },
    SETID(state, id) {
        state.userId = id;
        localStorage.setItem("userId", id);
    },
    TOOGLETHEME(state, dark) {
        state.darkMode = dark
        localStorage.setItem("darkMode", dark);
    }
}

//export store module
export default new Vuex.Store({
    state,
    getters,
    actions,
    mutations
})