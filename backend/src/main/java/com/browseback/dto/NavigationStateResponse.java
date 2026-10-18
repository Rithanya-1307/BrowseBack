package com.browseback.dto;

import com.browseback.model.HistoryRecord;

public class NavigationStateResponse {
    private HistoryRecord current;
    private boolean canGoBack;
    private boolean canGoForward;
    private int backStackSize;
    private int forwardStackSize;

    public NavigationStateResponse() {}

    public NavigationStateResponse(HistoryRecord current, boolean canGoBack, boolean canGoForward,
                                   int backStackSize, int forwardStackSize) {
        this.current = current;
        this.canGoBack = canGoBack;
        this.canGoForward = canGoForward;
        this.backStackSize = backStackSize;
        this.forwardStackSize = forwardStackSize;
    }

    public HistoryRecord getCurrent() {
        return current;
    }

    public void setCurrent(HistoryRecord current) {
        this.current = current;
    }

    public boolean isCanGoBack() {
        return canGoBack;
    }

    public void setCanGoBack(boolean canGoBack) {
        this.canGoBack = canGoBack;
    }

    public boolean isCanGoForward() {
        return canGoForward;
    }

    public void setCanGoForward(boolean canGoForward) {
        this.canGoForward = canGoForward;
    }

    public int getBackStackSize() {
        return backStackSize;
    }

    public void setBackStackSize(int backStackSize) {
        this.backStackSize = backStackSize;
    }

    public int getForwardStackSize() {
        return forwardStackSize;
    }

    public void setForwardStackSize(int forwardStackSize) {
        this.forwardStackSize = forwardStackSize;
    }
}
