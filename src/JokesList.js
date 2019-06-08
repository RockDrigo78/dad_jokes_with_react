import React, { Component } from 'react';
import Joke from './Joke';
import axios from 'axios';
import uuid from 'uuid/v4';
import './JokeList.css';

class JokesList extends Component {

  static defaultProps = {
    numJokesToGet: 10
  }

  constructor(props){
    super(props);
    this.state = { 
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]") 
    };
    this.seenJokes = new Set(this.state.jokes.map(joke=>joke.text));
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount(){
   if(this.state.jokes.length === 0){
     this.getJokes();
   }
  }    

  async getJokes(){

    try{

    let jokes = [];

    while(jokes.length < this.props.numJokesToGet){
      let res = await axios.get("https://icanhazdadjoke.com/", 
        {headers: {Accept: "application/json"}}
        );
        let newJoke = res.data.joke;
        if(!this.seenJokes.has(newJoke)) {
        jokes.push({ id: uuid(), text: newJoke, votes: 0 });
      } else {
        console.log("found duplicate");
        console.log(newJoke);
      }
    }

    this.setState(
      st=>({
      loading: false,
      jokes: [...st.jokes, ...jokes]
    }),
    ()=> window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))    
    );} 
    
    catch (e){
      console.log(e);
      this.setState({loading: false});
    }

  }

  handleVote(id, delta) {
    this.setState(st => {
      return {
        jokes: st.jokes.map(joke => 
          joke.id === id ? { ...joke, votes: joke.votes + delta} : joke)
      }
    },
    ()=> window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }

  clearList(){
    window.localStorage.clear();
    window.location.reload();
  }

  handleClick(){
    this.setState({loading: true}, this.getJokes);
  }
  
  render(){
    if(this.state.loading){
      return(
        <div className="JokeList-spinner">
          <i className="far fa-8x fa-laugh fa-spin"/>
          <h1 className="JokeList-title">Loading...</h1>
        </div>
      )
    }

    let jokes = this.state.jokes.sort((a, b)=>b.votes - a.votes);
    return(
      <div className="JokeList">
      <div className="JokeList-sidebar">
        <h1 className="JokeList-title">
          <span>Dad Jokes</span>
        </h1>
        <img alt="smile icon"
          src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"
        />
        <button className="JokeList-getmore" onClick={this.handleClick}>New Jokes</button>
        <p className="JokeList-jokesCuantity">Total Jokes: {this.state.jokes.length}</p>
        <button className="JokeList-clearList" onClick={this.clearList}>Clear list</button>
      </div>
        <div className="JokeList-jokes">
          {jokes.map(joke=>(
            <Joke 
              votes={joke.votes} 
              key={joke.id} 
              text={joke.text}
              upvote={()=>this.handleVote(joke.id, 1)}
              downvote={()=>this.handleVote(joke.id, -1)} />
          ))}        
        </div>
      </div>
    )
  }
}

export default JokesList;