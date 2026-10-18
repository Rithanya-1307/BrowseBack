package com.browseback.dsa;

/**
 * Unit I: Custom Stack implementation built from scratch using linked nodes.
 * Adheres strictly to the LIFO (Last-In-First-Out) principle.
 *
 * Used to power browser Back and Forward navigation stacks.
 * Does NOT use Java's built-in Stack, Deque, or LinkedList.
 *
 * @param <T> the type of elements stored in the stack
 */
public class CustomStack<T> {

    /**
     * Internal node structure for the linked stack.
     */
    private static class Node<E> {
        final E data;
        final Node<E> next;

        Node(E data, Node<E> next) {
            this.data = data;
            this.next = next;
        }
    }

    private Node<T> top;
    private int size;

    /**
     * Constructs an empty CustomStack.
     */
    public CustomStack() {
        this.top = null;
        this.size = 0;
    }

    /**
     * Pushes an element onto the top of the stack.
     * Time Complexity: O(1)
     *
     * @param item the element to push
     */
    public void push(T item) {
        top = new Node<>(item, top);
        size++;
    }

    /**
     * Removes and returns the element at the top of the stack.
     * Time Complexity: O(1)
     *
     * @return the element removed from top
     * @throws IllegalStateException if the stack is empty
     */
    public T pop() {
        if (isEmpty()) {
            throw new IllegalStateException("Cannot pop from an empty stack.");
        }
        T value = top.data;
        top = top.next;
        size--;
        return value;
    }

    /**
     * Inspects the element at the top of the stack without removing it.
     * Time Complexity: O(1)
     *
     * @return the top element, or null if the stack is empty
     */
    public T peek() {
        if (isEmpty()) {
            return null;
        }
        return top.data;
    }

    /**
     * Checks whether the stack contains zero elements.
     * Time Complexity: O(1)
     *
     * @return true if the stack is empty, false otherwise
     */
    public boolean isEmpty() {
        return top == null || size == 0;
    }

    /**
     * Returns the current number of elements in the stack.
     * Time Complexity: O(1)
     *
     * @return element count
     */
    public int size() {
        return size;
    }

    /**
     * Clears all elements from the stack.
     * Time Complexity: O(1)
     */
    public void clear() {
        top = null;
        size = 0;
    }

    /**
     * Returns an array representation of the stack elements from top to bottom.
     * Does not mutate the stack.
     *
     * @return array of elements
     */
    @SuppressWarnings("unchecked")
    public Object[] toArray() {
        Object[] result = new Object[size];
        Node<T> current = top;
        int index = 0;
        while (current != null) {
            result[index++] = current.data;
            current = current.next;
        }
        return result;
    }

    @Override
    public String toString() {
        if (isEmpty()) {
            return "CustomStack [empty]";
        }
        StringBuilder sb = new StringBuilder("CustomStack (top -> bottom): [");
        Node<T> current = top;
        while (current != null) {
            sb.append(current.data);
            if (current.next != null) {
                sb.append(", ");
            }
            current = current.next;
        }
        sb.append("]");
        return sb.toString();
    }
}
