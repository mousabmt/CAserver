class Collection {
  constructor(model) {
    this.model = model;
  }
async read(id = null, options = null) {
  try {
    if (id) {
      return await this.model.findOne({
        where: { [this.model.primaryKeyAttribute]: id },
        ...(options || {})
      });
    }
    if (options) {
      return await this.model.findAll(options);
    }
    return await this.model.findAll();
  } catch (error) {
    console.error("Error reading record:", error.message);
    return null;
  }
}

async create(data) {
  try {
    const newData = await this.model.create(data);
    return newData;
  } catch (error) {
    if (error.errors && Array.isArray(error.errors)) {
      console.error("Validation errors:");
      error.errors.forEach(err =>
        console.error(`- ${err.path}: ${err.message}`)
      );
    } else {
      console.error("Unexpected error:", error);
    }
    return null;
  }
}


async update(id, obj, options = {}) {
  try {
    await this.model.update(obj, {
      where: { [this.model.primaryKeyAttribute]: id },
      ...options
    });
    return await this.read(id);
  } catch (error) {
    console.error("Error updating record:", error.message);
    return null;
  }
}


async delete(id = null, options = {}) {
  try {
    if (id) {
      return await this.model.destroy({
        where: { [this.model.primaryKeyAttribute]: id },
        ...options
      });
    } else {
      return await this.model.destroy(options);
    }
  } catch (error) {
    console.error("Error deleting record:", error.message);
    return null;
  }
}

}

module.exports = Collection;
