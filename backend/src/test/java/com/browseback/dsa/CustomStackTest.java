package com.browseback.dsa;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Unit I: CustomStack Tests")
public class CustomStackTest {

    private CustomStack<String> stack;

    @BeforeEach
    void setUp() {
        stack = new CustomStack<>();
    }

    @Test
    @DisplayName("New stack should be empty and have size 0")
    void testInitialEmptyState() {
        assertTrue(stack.isEmpty());
        assertEquals(0, stack.size());
        assertNull(stack.peek());
    }

    @Test
    @DisplayName("Push adds elements and updates size")
    void testPush() {
        stack.push("Page A");
        assertFalse(stack.isEmpty());
        assertEquals(1, stack.size());
        assertEquals("Page A", stack.peek());

        stack.push("Page B");
        assertEquals(2, stack.size());
        assertEquals("Page B", stack.peek());
    }

    @Test
    @DisplayName("Pop removes and returns elements in LIFO order")
    void testPopLIFO() {
        stack.push("Page 1");
        stack.push("Page 2");
        stack.push("Page 3");

        assertEquals("Page 3", stack.pop());
        assertEquals(2, stack.size());
        assertEquals("Page 2", stack.peek());

        assertEquals("Page 2", stack.pop());
        assertEquals(1, stack.size());
        assertEquals("Page 1", stack.peek());

        assertEquals("Page 1", stack.pop());
        assertTrue(stack.isEmpty());
        assertEquals(0, stack.size());
    }

    @Test
    @DisplayName("Pop on empty stack should throw IllegalStateException")
    void testPopEmptyThrowsException() {
        assertThrows(IllegalStateException.class, () -> stack.pop());
    }

    @Test
    @DisplayName("Peek on empty stack returns null without throwing")
    void testPeekEmptyReturnsNull() {
        assertNull(stack.peek());
    }

    @Test
    @DisplayName("Clear removes all elements and resets size")
    void testClear() {
        stack.push("A");
        stack.push("B");
        stack.push("C");
        assertEquals(3, stack.size());

        stack.clear();
        assertTrue(stack.isEmpty());
        assertEquals(0, stack.size());
        assertNull(stack.peek());
    }
}
