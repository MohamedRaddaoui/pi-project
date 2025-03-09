describe("Users API", () => {
  it("should return a valid response from the backend", () => {
    cy.request("/users").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.a("string");
      expect(response.body).to.eq("respond with a resource");
    });
  });
});
