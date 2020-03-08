import styled from 'styled-components';

export const Input = styled.input`
  line-height: 1.427;
  border-radius: 2px;
  padding: 6px;
  position: relative;
  font-size: 16px;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
`;

export const CheckBox = styled(Input).attrs(() => ({
  type: 'checkbox'
}))`
  width: auto;
`;

export const BaseButton = styled.button`
  color: inherit;
  border: 0;
  cursor: pointer;
  margin: 0;
  display: inline-flex;
  outline: 0;
  padding: 0;
  position: relative;
  align-items: center;
  user-select: none;
  border-radius: 0;
  vertical-align: middle;
  -moz-appearance: none;
  justify-content: center;
  text-decoration: none;
  background-color: transparent;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
`;
