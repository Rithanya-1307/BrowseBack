package com.browseback.dto;

public class PerformanceComparisonResponse {
    private String targetUrl;
    private int datasetSize;

    // Successful Lookup (Target URL found)
    private int sequentialComparisons;
    private long sequentialDurationNano;
    private String sequentialComplexity;
    private int hashComparisons;
    private long hashDurationNano;
    private String hashComplexity;
    private double speedupFactor;
    private boolean exactMatchFound;

    // Unsuccessful Lookup (Non-existent URL benchmark)
    private String unsuccessfulTargetUrl;
    private int unsuccessfulSequentialComparisons;
    private long unsuccessfulSequentialDurationNano;
    private int unsuccessfulHashComparisons;
    private long unsuccessfulHashDurationNano;

    // Measurement Methodology
    private int repeatedIterations;
    private String measurementMethod;
    private String notes;

    public PerformanceComparisonResponse() {}

    public PerformanceComparisonResponse(String targetUrl, int datasetSize,
                                         int sequentialComparisons, long sequentialDurationNano, String sequentialComplexity,
                                         int hashComparisons, long hashDurationNano, String hashComplexity,
                                         double speedupFactor, boolean exactMatchFound) {
        this(targetUrl, datasetSize, sequentialComparisons, sequentialDurationNano, sequentialComplexity,
                hashComparisons, hashDurationNano, hashComplexity, speedupFactor, exactMatchFound,
                "https://nonexistent-sample-benchmark.edu/test", datasetSize, 0L, 0, 0L, 1,
                "Single measurement (warmup not applied)", "Machine-dependent hardware measurement");
    }

    public PerformanceComparisonResponse(String targetUrl, int datasetSize,
                                         int sequentialComparisons, long sequentialDurationNano, String sequentialComplexity,
                                         int hashComparisons, long hashDurationNano, String hashComplexity,
                                         double speedupFactor, boolean exactMatchFound,
                                         String unsuccessfulTargetUrl,
                                         int unsuccessfulSequentialComparisons, long unsuccessfulSequentialDurationNano,
                                         int unsuccessfulHashComparisons, long unsuccessfulHashDurationNano,
                                         int repeatedIterations, String measurementMethod, String notes) {
        this.targetUrl = targetUrl;
        this.datasetSize = datasetSize;
        this.sequentialComparisons = sequentialComparisons;
        this.sequentialDurationNano = sequentialDurationNano;
        this.sequentialComplexity = sequentialComplexity;
        this.hashComparisons = hashComparisons;
        this.hashDurationNano = hashDurationNano;
        this.hashComplexity = hashComplexity;
        this.speedupFactor = speedupFactor;
        this.exactMatchFound = exactMatchFound;
        this.unsuccessfulTargetUrl = unsuccessfulTargetUrl;
        this.unsuccessfulSequentialComparisons = unsuccessfulSequentialComparisons;
        this.unsuccessfulSequentialDurationNano = unsuccessfulSequentialDurationNano;
        this.unsuccessfulHashComparisons = unsuccessfulHashComparisons;
        this.unsuccessfulHashDurationNano = unsuccessfulHashDurationNano;
        this.repeatedIterations = repeatedIterations;
        this.measurementMethod = measurementMethod;
        this.notes = notes;
    }

    public String getTargetUrl() {
        return targetUrl;
    }

    public void setTargetUrl(String targetUrl) {
        this.targetUrl = targetUrl;
    }

    public int getDatasetSize() {
        return datasetSize;
    }

    public void setDatasetSize(int datasetSize) {
        this.datasetSize = datasetSize;
    }

    public int getSequentialComparisons() {
        return sequentialComparisons;
    }

    public void setSequentialComparisons(int sequentialComparisons) {
        this.sequentialComparisons = sequentialComparisons;
    }

    public long getSequentialDurationNano() {
        return sequentialDurationNano;
    }

    public void setSequentialDurationNano(long sequentialDurationNano) {
        this.sequentialDurationNano = sequentialDurationNano;
    }

    public String getSequentialComplexity() {
        return sequentialComplexity;
    }

    public void setSequentialComplexity(String sequentialComplexity) {
        this.sequentialComplexity = sequentialComplexity;
    }

    public int getHashComparisons() {
        return hashComparisons;
    }

    public void setHashComparisons(int hashComparisons) {
        this.hashComparisons = hashComparisons;
    }

    public long getHashDurationNano() {
        return hashDurationNano;
    }

    public void setHashDurationNano(long hashDurationNano) {
        this.hashDurationNano = hashDurationNano;
    }

    public String getHashComplexity() {
        return hashComplexity;
    }

    public void setHashComplexity(String hashComplexity) {
        this.hashComplexity = hashComplexity;
    }

    public double getSpeedupFactor() {
        return speedupFactor;
    }

    public void setSpeedupFactor(double speedupFactor) {
        this.speedupFactor = speedupFactor;
    }

    public boolean isExactMatchFound() {
        return exactMatchFound;
    }

    public void setExactMatchFound(boolean exactMatchFound) {
        this.exactMatchFound = exactMatchFound;
    }

    public String getUnsuccessfulTargetUrl() {
        return unsuccessfulTargetUrl;
    }

    public void setUnsuccessfulTargetUrl(String unsuccessfulTargetUrl) {
        this.unsuccessfulTargetUrl = unsuccessfulTargetUrl;
    }

    public int getUnsuccessfulSequentialComparisons() {
        return unsuccessfulSequentialComparisons;
    }

    public void setUnsuccessfulSequentialComparisons(int unsuccessfulSequentialComparisons) {
        this.unsuccessfulSequentialComparisons = unsuccessfulSequentialComparisons;
    }

    public long getUnsuccessfulSequentialDurationNano() {
        return unsuccessfulSequentialDurationNano;
    }

    public void setUnsuccessfulSequentialDurationNano(long unsuccessfulSequentialDurationNano) {
        this.unsuccessfulSequentialDurationNano = unsuccessfulSequentialDurationNano;
    }

    public int getUnsuccessfulHashComparisons() {
        return unsuccessfulHashComparisons;
    }

    public void setUnsuccessfulHashComparisons(int unsuccessfulHashComparisons) {
        this.unsuccessfulHashComparisons = unsuccessfulHashComparisons;
    }

    public long getUnsuccessfulHashDurationNano() {
        return unsuccessfulHashDurationNano;
    }

    public void setUnsuccessfulHashDurationNano(long unsuccessfulHashDurationNano) {
        this.unsuccessfulHashDurationNano = unsuccessfulHashDurationNano;
    }

    public int getRepeatedIterations() {
        return repeatedIterations;
    }

    public void setRepeatedIterations(int repeatedIterations) {
        this.repeatedIterations = repeatedIterations;
    }

    public String getMeasurementMethod() {
        return measurementMethod;
    }

    public void setMeasurementMethod(String measurementMethod) {
        this.measurementMethod = measurementMethod;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
