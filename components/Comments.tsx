import { Component, h } from "./deps.ts";

interface CommentsProps {
  comments: unknown[];
}

export class Comments extends Component<CommentsProps> {
  render() {
    return (
      <ul>
        {this.props.comments.map((comment) => <li>{comment}</li>)}
      </ul>
    );
  }
}
