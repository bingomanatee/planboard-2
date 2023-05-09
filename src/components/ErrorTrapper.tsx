import { Component } from 'react'


export default class ErrorTrapper extends Component<any, any> {
  state = {
    error: null,
  };

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI.
    return { error: error };
  }

  componentDidCatch(error, info) {
    // Log the error to an error reporting service
    console.log(error, info);
  }

  render() {
    if (this.state.error) {
      // You can render any custom fallback UI
      return <p>Render Error: <b>{this.props.boundry}</b>:
        <code>
          {this.state.error?.message}
        </code>
      </p>;
    }
    return this.props.children;
  }
}
